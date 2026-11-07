import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { getOjtInfo, ojtLogRepo, saveOjtInfo } from '@/db/repositories/ojtRepo';
import { getProfile } from '@/db/repositories/profileRepo';
import { ojtRequirementRepo, setOjtRequirementDone } from '@/db/repositories/ojtRequirementRepo';
import { useEntry, useEntryList } from '@/hooks/useVaultEntries';
import { exportDtrPdf, shareStoredPdf } from '@/services/pdfService';
import { buildDtrHtml } from '@/templates/dtr';
import type { OjtInfo, OjtInfoInput } from '@/types/ojt';
import { computeOjtProgress } from '@/utils/ojtProgress';

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

/**
 * DTR PDF export (FR-O5): reads the setup, all logs and the trainee's name,
 * builds the HTML table, prints it to PDF, then opens the Share sheet.
 * Throws on failure so the screen can show a message.
 */
export function useDtrExport() {
  const db = useSQLiteContext();

  return useCallback(async () => {
    const [info, logs, profile] = await Promise.all([getOjtInfo(db), ojtLogRepo.list(db), getProfile(db)]);
    if (!info) throw new Error('OJT is not set up');

    const oldestFirst = [...logs].reverse(); // the list is newest first; a DTR reads oldest first
    const traineeName = profile?.fullName.trim() ?? '';
    const html = buildDtrHtml({
      traineeName,
      info,
      logs: oldestFirst,
      progress: computeOjtProgress(info.requiredHours, logs),
    });
    const path = await exportDtrPdf(traineeName || 'OJT', html);
    await shareStoredPdf(path, 'OJT Daily Time Record');
  }, [db]);
}
