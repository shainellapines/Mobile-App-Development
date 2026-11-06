import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import {
  createExperience,
  deleteExperience,
  getExperience,
  listExperiences,
  updateExperience,
} from '@/db/repositories/experienceRepo';
import type { Experience, ExperienceInput } from '@/types/experience';

/**
 * The list of all experiences, for the list screen.
 * Reloads whenever the screen comes into focus (e.g., after adding or editing one).
 */
export function useExperiences() {
  const db = useSQLiteContext();
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setItems(await listExperiences(db));
    } catch (e) {
      console.warn('[experience] list failed', e);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { items, loading, refresh };
}

/**
 * One experience for the add/edit form.
 * - id undefined → "add" mode: nothing to load, save() creates a new record.
 * - id given → "edit" mode: loads the record, save() updates it, remove() deletes it.
 * save() and remove() throw on failure so the screen can show an error message.
 */
export function useExperience(id: number | undefined) {
  const db = useSQLiteContext();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(id !== undefined);

  useFocusEffect(
    useCallback(() => {
      if (id === undefined) return;
      getExperience(db, id)
        .then(setExperience)
        .catch((e) => console.warn('[experience] load failed', e))
        .finally(() => setLoading(false));
    }, [db, id])
  );

  const save = useCallback(
    async (input: ExperienceInput) => {
      if (id === undefined) {
        await createExperience(db, input);
      } else {
        await updateExperience(db, id, input);
      }
    },
    [db, id]
  );

  const remove = useCallback(async () => {
    if (id !== undefined) await deleteExperience(db, id);
  }, [db, id]);

  return { experience, loading, save, remove };
}
