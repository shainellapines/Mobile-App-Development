import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';

import { getSetting, setSetting, SETTING_KEYS } from '@/db/repositories/settingsRepo';

/**
 * Has the user finished (or skipped) the intro slides?
 * null while loading. Saved in the `settings` table, so "Reset all data" shows the intro again.
 */
export function useOnboardingDone(): boolean | null {
  const db = useSQLiteContext();
  const [done, setDone] = useState<boolean | null>(null);

  useEffect(() => {
    getSetting(db, SETTING_KEYS.onboardingDone)
      .then((value) => setDone(value === 'true'))
      .catch((e) => {
        console.warn('[onboarding] read failed', e);
        setDone(true); // never trap the user in the intro because of an error
      });
  }, [db]);

  return done;
}

/** Marks the intro as seen. */
export function useCompleteOnboarding() {
  const db = useSQLiteContext();
  return useCallback(() => setSetting(db, SETTING_KEYS.onboardingDone, 'true'), [db]);
}
