import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { getProfile, saveProfile } from '@/db/repositories/profileRepo';
import type { Profile, ProfileInput } from '@/types/profile';

/**
 * Loads the single user profile and exposes a save action.
 * Screens use this hook instead of talking to the database directly (Section 9).
 * Data reloads every time the screen comes into focus, so it is always current
 * (e.g., the Vault tab shows the new name right after you edit the profile).
 */
export function useProfile() {
  const db = useSQLiteContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setProfile(await getProfile(db));
    } catch (e) {
      console.warn('[profile] load failed', e);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  /** Saves the profile. Throws on failure so the screen can show an error message. */
  const save = useCallback(
    async (input: ProfileInput) => {
      const saved = await saveProfile(db, input);
      setProfile(saved);
      return saved;
    },
    [db]
  );

  return { profile, loading, save, refresh };
}
