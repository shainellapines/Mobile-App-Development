import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { getProfile, saveProfile, setProfilePhoto } from '@/db/repositories/profileRepo';
import {
  deleteStoredFiles,
  pickFrom,
  saveToAttachments,
  type AttachmentSource,
} from '@/services/fileService';
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

  /**
   * Picks a square photo, copies it into the app, saves it right away, then deletes the old photo.
   * Returns false if the user cancelled. Throws on errors (too large, no permission).
   */
  const changePhoto = useCallback(
    async (source: AttachmentSource): Promise<boolean> => {
      const picked = await pickFrom(source, true);
      if (!picked) return false;
      const stored = await saveToAttachments(picked);
      const oldPath = await setProfilePhoto(db, stored.path);
      if (oldPath) deleteStoredFiles([oldPath]);
      await refresh();
      return true;
    },
    [db, refresh]
  );

  const removePhoto = useCallback(async () => {
    const oldPath = await setProfilePhoto(db, null);
    if (oldPath) deleteStoredFiles([oldPath]);
    await refresh();
  }, [db, refresh]);

  return { profile, loading, save, refresh, changePhoto, removePhoto };
}
