import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { certificationRepo } from '@/db/repositories/certificationRepo';
import { educationRepo } from '@/db/repositories/educationRepo';
import { experienceRepo } from '@/db/repositories/experienceRepo';
import { projectRepo } from '@/db/repositories/projectRepo';
import { skillRepo } from '@/db/repositories/skillRepo';
import type { EntryRepo } from '@/db/repositories/types';

/**
 * GENERIC: loads every record of one vault category, for a list screen.
 * Reloads whenever the screen comes into focus (e.g., after adding or editing one).
 * `repo` must be a module-level constant so it never changes between renders.
 */
export function useEntryList<T, I>(repo: EntryRepo<T, I>) {
  const db = useSQLiteContext();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setItems(await repo.list(db));
    } catch (e) {
      console.warn('[vault] list failed', e);
    } finally {
      setLoading(false);
    }
  }, [db, repo]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { items, loading, refresh };
}

/**
 * GENERIC: one record for an add/edit form.
 * - id undefined → "add" mode: nothing to load, save() creates a new record.
 * - id given → "edit" mode: loads the record, save() updates it, remove() deletes it.
 * save() and remove() throw on failure so the form can show an error message.
 */
export function useEntry<T, I>(id: number | undefined, repo: EntryRepo<T, I>) {
  const db = useSQLiteContext();
  const [entry, setEntry] = useState<T | null>(null);
  const [loading, setLoading] = useState(id !== undefined);

  useFocusEffect(
    useCallback(() => {
      if (id === undefined) return;
      repo
        .get(db, id)
        .then(setEntry)
        .catch((e) => console.warn('[vault] load failed', e))
        .finally(() => setLoading(false));
    }, [db, id, repo])
  );

  /** Creates or updates, and returns the record's id (new id when creating). */
  const save = useCallback(
    async (input: I): Promise<number> => {
      if (id === undefined) return repo.create(db, input);
      await repo.update(db, id, input);
      return id;
    },
    [db, id, repo]
  );

  const remove = useCallback(async () => {
    if (id !== undefined) await repo.remove(db, id);
  }, [db, id, repo]);

  return { entry, loading, save, remove };
}

/** Reads "?id=3" from the current route. Returns undefined when adding a new entry. */
export function useIdParam(): number | undefined {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const parsed = id ? Number(id) : NaN;
  return Number.isInteger(parsed) ? parsed : undefined;
}

// ── Ready-to-use hooks per category ─────────────────────────────────────────
// Each one is the generic hook plugged into that category's repository.

export const useExperiences = () => useEntryList(experienceRepo);
export const useExperience = (id: number | undefined) => useEntry(id, experienceRepo);

export const useEducationList = () => useEntryList(educationRepo);
export const useEducation = (id: number | undefined) => useEntry(id, educationRepo);

export const useProjects = () => useEntryList(projectRepo);
export const useProject = (id: number | undefined) => useEntry(id, projectRepo);

export const useSkills = () => useEntryList(skillRepo);
export const useSkill = (id: number | undefined) => useEntry(id, skillRepo);

export const useCertifications = () => useEntryList(certificationRepo);
export const useCertification = (id: number | undefined) => useEntry(id, certificationRepo);
