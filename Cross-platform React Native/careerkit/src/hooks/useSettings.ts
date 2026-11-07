import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { getDbInfo, type DbInfo } from '@/db/repositories/dbInfoRepo';
import { clearAllTables } from '@/db/repositories/resetRepo';
import {
  disableLock,
  getBiometricSupport,
  isBiometricsEnabled,
  isLockEnabled,
  setBiometricsEnabled,
  type BiometricSupport,
} from '@/services/authService';
import { deleteAllAttachments } from '@/services/fileService';
import { cancelAllReminders } from '@/services/notificationService';
import { deleteAllResumePdfs } from '@/services/pdfService';

type SettingsState = {
  lockEnabled: boolean;
  biometricsEnabled: boolean;
  biometric: BiometricSupport;
  dbInfo: DbInfo | null;
};

/** Settings screen data: App Lock state, biometrics, and DB info. Reloads on focus. */
export function useSettings() {
  const db = useSQLiteContext();
  const [state, setState] = useState<SettingsState | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [lockEnabled, biometricsEnabled, biometric, dbInfo] = await Promise.all([
        isLockEnabled(),
        isBiometricsEnabled(),
        getBiometricSupport(),
        getDbInfo(db),
      ]);
      setState({ lockEnabled, biometricsEnabled, biometric, dbInfo });
    } catch (e) {
      console.warn('[settings] load failed', e);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const toggleBiometrics = useCallback(
    async (enabled: boolean) => {
      await setBiometricsEnabled(enabled);
      await refresh();
    },
    [refresh]
  );

  /**
   * Reset all data (FR-L3): every table, every attached file and PDF,
   * every scheduled reminder, and the App Lock PIN. The app is then like a fresh install.
   */
  const resetAllData = useCallback(async () => {
    await clearAllTables(db);
    deleteAllAttachments();
    deleteAllResumePdfs();
    await cancelAllReminders();
    await disableLock();
    await refresh();
  }, [db, refresh]);

  return { state, toggleBiometrics, resetAllData };
}
