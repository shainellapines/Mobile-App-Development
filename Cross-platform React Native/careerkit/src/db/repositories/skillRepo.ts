import type { SQLiteDatabase } from 'expo-sqlite';

import { nowIso } from '@/db/client';
import { deleteResumeItemsFor } from '@/db/repositories/resumeItemRepo';
import type { EntryRepo } from '@/db/repositories/types';
import type { Skill, SkillCategory, SkillInput, SkillLevel } from '@/types/skill';

type SkillRow = {
  id: number;
  name: string;
  category: SkillCategory;
  level: SkillLevel | null;
  created_at: string;
  updated_at: string;
};

function toSkill(row: SkillRow): Skill {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    level: row.level,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Skills have no dates, so they are grouped by category, then sorted A–Z.
 * "COLLATE NOCASE" makes "react" and "React" sort together.
 */
async function listSkills(db: SQLiteDatabase): Promise<Skill[]> {
  const rows = await db.getAllAsync<SkillRow>(
    'SELECT * FROM skills ORDER BY category, name COLLATE NOCASE'
  );
  return rows.map(toSkill);
}

async function getSkill(db: SQLiteDatabase, id: number): Promise<Skill | null> {
  const row = await db.getFirstAsync<SkillRow>('SELECT * FROM skills WHERE id = ?', [id]);
  return row ? toSkill(row) : null;
}

async function createSkill(db: SQLiteDatabase, input: SkillInput): Promise<number> {
  const now = nowIso();
  const result = await db.runAsync(
    'INSERT INTO skills (name, category, level, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [input.name, input.category, input.level, now, now]
  );
  return result.lastInsertRowId;
}

async function updateSkill(db: SQLiteDatabase, id: number, input: SkillInput): Promise<void> {
  await db.runAsync(
    'UPDATE skills SET name = ?, category = ?, level = ?, updated_at = ? WHERE id = ?',
    [input.name, input.category, input.level, nowIso(), id]
  );
}

/** Deletes the skill and removes it from saved resumes. Skills have no attachments (FR-D1). */
async function deleteSkill(db: SQLiteDatabase, id: number): Promise<void> {
  await db.withTransactionAsync(async () => {
    await deleteResumeItemsFor(db, 'skill', id);
    await db.runAsync('DELETE FROM skills WHERE id = ?', [id]);
  });
}

export const skillRepo: EntryRepo<Skill, SkillInput> = {
  list: listSkills,
  get: getSkill,
  create: createSkill,
  update: updateSkill,
  remove: deleteSkill,
};
