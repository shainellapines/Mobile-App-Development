import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import {
  applicationRepo,
  setApplicationNotificationId,
  setApplicationStatus,
} from '@/db/repositories/applicationRepo';
import { useEntry, useEntryList } from '@/hooks/useVaultEntries';
import { cancelReminder, scheduleNextStepReminder, type ReminderResult } from '@/services/notificationService';
import type { ApplicationStatus } from '@/types/application';

/** All applications, most recent first (Applications tab). */
export const useApplications = () => useEntryList(applicationRepo);

/** Rejected / withdrawn applications are closed: no more reminders for them. */
const isClosed = (status: ApplicationStatus) => status === 'rejected' || status === 'withdrawn';

/** What saving an application returns: its id, and what happened with the next-step reminder. */
export type ApplicationSaveResult = { id: number; reminder: ReminderResult };

/**
 * One application for the form or detail screen: the generic useEntry, plus
 * - changeStatus: a quick status change from the detail screen (FR-A2),
 * - next-step reminders (FR-A5), handled like requirement reminders:
 *   save first → cancel the old reminder → schedule a new one → remember its id.
 */
export function useApplication(id: number | undefined) {
  const db = useSQLiteContext();
  const { entry, loading, save: saveEntry, remove: removeEntry, refresh } = useEntry(id, applicationRepo);

  /** Re-plans the reminder of a saved application from what is in the database now. */
  const reschedule = useCallback(
    async (appId: number): Promise<ReminderResult> => {
      const saved = await applicationRepo.get(db, appId);
      if (!saved) return { kind: 'not_needed' };
      await cancelReminder(saved.notificationId);

      let reminder: ReminderResult = { kind: 'not_needed' };
      try {
        reminder = await scheduleNextStepReminder({
          applicationId: appId,
          company: saved.company,
          position: saved.position,
          nextStepDate: saved.nextStepDate,
          isClosed: isClosed(saved.status),
        });
      } catch (e) {
        console.warn('[applications] scheduling reminder failed', e);
      }
      await setApplicationNotificationId(db, appId, reminder.kind === 'scheduled' ? reminder.notificationId : null);
      return reminder;
    },
    [db]
  );

  const save = useCallback(
    async (input: Parameters<typeof saveEntry>[0]): Promise<ApplicationSaveResult> => {
      const savedId = await saveEntry(input);
      return { id: savedId, reminder: await reschedule(savedId) };
    },
    [saveEntry, reschedule]
  );

  const remove = useCallback(async () => {
    await cancelReminder(entry?.notificationId ?? null);
    await removeEntry();
  }, [entry, removeEntry]);

  const changeStatus = useCallback(
    async (status: ApplicationStatus) => {
      if (id === undefined) return;
      await setApplicationStatus(db, id, status);
      await reschedule(id); // e.g. "rejected" cancels a pending interview reminder
      await refresh();
    },
    [db, id, reschedule, refresh]
  );

  return { entry, loading, save, remove, changeStatus };
}
