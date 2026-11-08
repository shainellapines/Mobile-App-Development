import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { DEFAULT_REMINDER_DAYS } from '@/constants/requirements';
import type { TemplateSet } from '@/constants/requirementTemplates';
import { createManyRequirements } from '@/db/repositories/requirementRepo';

/** Adds the documents ticked on the Smart Templates screen (FR-Q2). */
export function useRequirementTemplates() {
  const db = useSQLiteContext();

  /**
   * Creates one requirement per name, in the template's category, marked "Not yet obtained"
   * (the user has not entered issue dates yet). Returns how many were added.
   */
  const addFromTemplate = useCallback(
    (names: string[], set: TemplateSet) =>
      createManyRequirements(
        db,
        names.map((name) => ({
          name,
          category: set,
          referenceNo: null,
          issueDate: null,
          expiryDate: null,
          statusOverride: 'not_yet_obtained' as const,
          notes: null,
          reminderDaysBefore: DEFAULT_REMINDER_DAYS,
        }))
      ),
    [db]
  );

  return { addFromTemplate };
}
