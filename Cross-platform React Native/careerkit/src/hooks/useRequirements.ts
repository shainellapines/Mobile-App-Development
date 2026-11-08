import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { requirementRepo, setRequirementNotificationId } from '@/db/repositories/requirementRepo';
import { useEntry, useEntryList } from '@/hooks/useVaultEntries';
import { cancelReminder, scheduleExpiryReminder, type ReminderResult } from '@/services/notificationService';
import type { RequirementInput } from '@/types/requirement';

/** All requirements, for the Requirements tab and the Smart Templates screen. */
export const useRequirements = () => useEntryList(requirementRepo);

/** What saving a requirement returns: its id, and what happened with the reminder. */
export type RequirementSaveResult = { id: number; reminder: ReminderResult };

/**
 * One requirement for the add/edit form — the generic useEntry, plus reminders (FR-Q5):
 * - save:   save the record → cancel its OLD reminder → schedule a new one → remember its id.
 * - remove: cancel its reminder → delete the record.
 * The record is always saved first, so a notification problem never loses the user's data.
 */
export function useRequirement(id: number | undefined) {
  const db = useSQLiteContext();
  const { entry, loading, save: saveEntry, remove: removeEntry } = useEntry(id, requirementRepo);

  const save = useCallback(
    async (input: RequirementInput): Promise<RequirementSaveResult> => {
      const savedId = await saveEntry(input);

      // Re-read the saved row to get the reminder that is scheduled for it right now.
      const saved = await requirementRepo.get(db, savedId);
      await cancelReminder(saved?.notificationId ?? null);

      let reminder: ReminderResult = { kind: 'not_needed' };
      try {
        reminder = await scheduleExpiryReminder({
          requirementId: savedId,
          name: input.name,
          // A document the user does not have yet gets no expiry reminder.
          expiryDate: input.statusOverride === 'not_yet_obtained' ? null : input.expiryDate,
          reminderDaysBefore: input.reminderDaysBefore,
        });
      } catch (e) {
        console.warn('[requirements] scheduling reminder failed', e);
      }
      await setRequirementNotificationId(db, savedId, reminder.kind === 'scheduled' ? reminder.notificationId : null);

      return { id: savedId, reminder };
    },
    [db, saveEntry]
  );

  const remove = useCallback(async () => {
    await cancelReminder(entry?.notificationId ?? null);
    await removeEntry();
  }, [entry, removeEntry]);

  return { entry, loading, save, remove };
}
