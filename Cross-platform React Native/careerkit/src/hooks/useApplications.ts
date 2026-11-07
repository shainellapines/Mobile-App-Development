import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { applicationRepo, setApplicationStatus } from '@/db/repositories/applicationRepo';
import { useEntry, useEntryList } from '@/hooks/useVaultEntries';
import type { ApplicationStatus } from '@/types/application';

/** All applications, most recent first (Applications tab). */
export const useApplications = () => useEntryList(applicationRepo);

/**
 * One application for the form or detail screen: the generic useEntry,
 * plus a quick status change that reloads the record afterwards (FR-A2).
 */
export function useApplication(id: number | undefined) {
  const db = useSQLiteContext();
  const { entry, loading, save, remove, refresh } = useEntry(id, applicationRepo);

  const changeStatus = useCallback(
    async (status: ApplicationStatus) => {
      if (id === undefined) return;
      await setApplicationStatus(db, id, status);
      await refresh();
    },
    [db, id, refresh]
  );

  return { entry, loading, save, remove, changeStatus };
}
