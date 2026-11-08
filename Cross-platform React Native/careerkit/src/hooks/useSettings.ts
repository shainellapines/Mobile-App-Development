import { useFocusEffect } from 'expo-router';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { getDbInfo, type DbInfo } from '@/db/repositories/dbInfoRepo';
import { applicationRepo, setApplicationNotificationId } from '@/db/repositories/applicationRepo';
import { seedDemoData } from '@/db/repositories/demoRepo';
import { requirementRepo, setRequirementNotificationId } from '@/db/repositories/requirementRepo';
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
import { cancelAllReminders, scheduleExpiryReminder, scheduleNextStepReminder } from '@/services/notificationService';
import { deleteAllPdfs } from '@/services/pdfService';
import { buildDemoData } from '@/utils/demoData';

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

  /** Empties every table, deletes every attached file and PDF, and cancels every reminder. */
  const clearEverything = useCallback(async () => {
    await clearAllTables(db);
    deleteAllAttachments();
    deleteAllPdfs();
    await cancelAllReminders();
  }, [db]);

  /**
   * Reset all data (FR-L3): everything above plus the App Lock PIN.
   * The app is then like a fresh install.
   */
  const resetAllData = useCallback(async () => {
    await clearEverything();
    await disableLock();
    await refresh();
  }, [clearEverything, refresh]);

  /**
   * Demo data (step 3.5): replaces all data with the sample student, then schedules the same
   * reminders the forms would (expiry + interview). The App Lock PIN is kept.
   */
  const loadDemoData = useCallback(async () => {
    await clearEverything();
    await seedDemoData(db, buildDemoData());
    try {
      await scheduleSeededReminders(db);
    } catch (e) {
      console.warn('[demo] scheduling reminders failed', e); // the data is loaded anyway
    }
    await refresh();
  }, [db, clearEverything, refresh]);

  return { state, toggleBiometrics, resetAllData, loadDemoData };
}

/** Schedules expiry reminders for every requirement and next-step reminders for open applications. */
async function scheduleSeededReminders(db: SQLiteDatabase): Promise<void> {
  for (const r of await requirementRepo.list(db)) {
    const reminder = await scheduleExpiryReminder({
      requirementId: r.id,
      name: r.name,
      expiryDate: r.statusOverride === 'not_yet_obtained' ? null : r.expiryDate,
      reminderDaysBefore: r.reminderDaysBefore,
    });
    if (reminder.kind === 'scheduled') await setRequirementNotificationId(db, r.id, reminder.notificationId);
  }
  for (const a of await applicationRepo.list(db)) {
    const reminder = await scheduleNextStepReminder({
      applicationId: a.id,
      company: a.company,
      position: a.position,
      nextStepDate: a.nextStepDate,
      isClosed: a.status === 'rejected' || a.status === 'withdrawn',
    });
    if (reminder.kind === 'scheduled') await setApplicationNotificationId(db, a.id, reminder.notificationId);
  }
}
