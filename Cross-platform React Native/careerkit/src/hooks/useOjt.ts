import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { getOjtInfo, ojtLogRepo, saveOjtInfo } from '@/db/repositories/ojtRepo';
import { ojtRequirementRepo, setOjtRequirementDone } from '@/db/repositories/ojtRequirementRepo';
import { useEntry, useEntryList } from '@/hooks/useVaultEntries';
import type { OjtInfo, OjtInfoInput } from '@/types/ojt';

/**
 * The OJT setup (single row). info is null until the user sets up their OJT.
 * save() returns how many default checklist items were added (only on the first setup).
 */
export function useOjtInfo() {
  const db = useSQLiteContext();
  const [info, setInfo] = useState<OjtInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setInfo(await getOjtInfo(db));
    } catch (e) {
      console.warn('[ojt] load setup failed', e);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const save = useCallback(
    async (input: OjtInfoInput) => {
      const seeded = await saveOjtInfo(db, input);
      await refresh();
      return seeded;
    },
    [db, refresh]
  );

  return { info, loading, save };
}

/** Daily time records, newest first. */
export const useOjtLogs = () => useEntryList(ojtLogRepo);
export const useOjtLog = (id: number | undefined) => useEntry(id, ojtLogRepo);

/** OJT requirements checklist, plus a one-tap done / not-done toggle. */
export function useOjtRequirements() {
  const db = useSQLiteContext();
  const { items, loading, refresh } = useEntryList(ojtRequirementRepo);

  const toggleDone = useCallback(
    async (id: number, isDone: boolean) => {
      await setOjtRequirementDone(db, id, isDone);
      await refresh();
    },
    [db, refresh]
  );

  return { items, loading, toggleDone };
}

export const useOjtRequirement = (id: number | undefined) => useEntry(id, ojtRequirementRepo);
