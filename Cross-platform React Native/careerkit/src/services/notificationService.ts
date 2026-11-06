import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import { REMINDER_CHANNEL_ID, REMINDER_CHANNEL_NAME } from '@/constants/notifications';
import { formatDate } from '@/utils/dates';
import { daysLeftText, reminderFireDate } from '@/utils/reminders';

/**
 * notificationService: the only place that talks to expo-notifications (Section 9).
 * LOCAL notifications only — they are scheduled on the phone itself, no server or internet.
 */

/**
 * Call once when the app starts:
 * - show reminders as a banner even while the app is open,
 * - on Android, create the notification channel the reminders are posted to.
 */
export async function initNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: REMINDER_CHANNEL_NAME,
      importance: AndroidImportance.HIGH,
    });
  }
}

/** Asks for permission the first time; afterwards just reports the user's choice. */
async function hasPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

/** What happened when we tried to schedule a reminder. */
export type ReminderResult =
  | { kind: 'scheduled'; notificationId: string; fireDate: Date }
  | { kind: 'not_needed' } // no expiry date, already expired, or not obtained yet
  | { kind: 'no_permission' };

/** Schedules the expiry reminder for one document (FR-Q5). */
export async function scheduleExpiryReminder(doc: {
  requirementId: number;
  name: string;
  expiryDate: string | null;
  reminderDaysBefore: number;
}): Promise<ReminderResult> {
  const fireDate = reminderFireDate(doc.expiryDate, doc.reminderDaysBefore);
  if (!fireDate || !doc.expiryDate) return { kind: 'not_needed' };
  if (!(await hasPermission())) return { kind: 'no_permission' };

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: `${doc.name} expires ${daysLeftText(doc.expiryDate, fireDate)}`,
      body: `Expiry date: ${formatDate(doc.expiryDate)}. Renew it early so your application is not delayed.`,
      data: { requirementId: doc.requirementId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireDate,
      channelId: REMINDER_CHANNEL_ID,
    },
  });
  return { kind: 'scheduled', notificationId, fireDate };
}

/** Cancels a scheduled reminder. Never throws: an already-fired or missing reminder is fine. */
export async function cancelReminder(notificationId: string | null): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.warn('[notifications] cancel failed', notificationId, e);
  }
}

/** DEVELOPMENT ONLY: fires a sample reminder in 10 seconds, to check notifications work on this phone. */
export async function sendTestReminder(name: string): Promise<boolean> {
  if (!(await hasPermission())) return false;
  await Notifications.scheduleNotificationAsync({
    content: { title: `${name} expires soon (test)`, body: 'This is how your expiry reminders will look.' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
      channelId: REMINDER_CHANNEL_ID,
    },
  });
  return true;
}
