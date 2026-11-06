import { addDays, differenceInCalendarDays, endOfDay, set, subDays } from 'date-fns';

import { REMINDER_HOUR } from '@/constants/notifications';
import { parseIsoDate } from '@/utils/dates';

/** Today (or another day) at REMINDER_HOUR:00:00. */
function atReminderHour(day: Date): Date {
  return set(day, { hours: REMINDER_HOUR, minutes: 0, seconds: 0, milliseconds: 0 });
}

/**
 * When should the expiry reminder go off? (FR-Q5) A PURE function, easy to test.
 * - Normally: `daysBefore` days before the expiry date, at 9:00 AM.
 * - If that moment has already passed but the document has NOT expired yet
 *   (e.g. it expires in 5 days but the reminder is set to 14 days before),
 *   remind at the next 9:00 AM instead, so the user still gets warned.
 * - Returns null when there is nothing to remind about: no expiry date, already expired,
 *   or the next 9:00 AM would be after the expiry day.
 */
export function reminderFireDate(
  expiryDate: string | null,
  daysBefore: number,
  now: Date = new Date()
): Date | null {
  const expiry = parseIsoDate(expiryDate);
  if (!expiry) return null;
  if (differenceInCalendarDays(expiry, now) < 0) return null; // already expired

  const planned = atReminderHour(subDays(expiry, daysBefore));
  if (planned > now) return planned;

  const todayAtHour = atReminderHour(now);
  const next = todayAtHour > now ? todayAtHour : addDays(todayAtHour, 1);
  return next <= endOfDay(expiry) ? next : null;
}

/** "in 14 days", "tomorrow", "today" — how far the expiry is from the reminder moment. */
export function daysLeftText(expiryDate: string, fireDate: Date): string {
  const expiry = parseIsoDate(expiryDate);
  if (!expiry) return '';
  const days = differenceInCalendarDays(expiry, fireDate);
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}
