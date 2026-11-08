import type { SQLiteDatabase } from 'expo-sqlite';

import { OJT_REQUIREMENT_DEFAULTS } from '@/constants/requirementTemplates';
import { nowIso } from '@/db/client';
import { deleteAttachmentsFor } from '@/db/repositories/attachmentRepo';
import type { EntryRepo } from '@/db/repositories/types';
import { deleteStoredFiles } from '@/services/fileService';
import type { OjtRequirement, OjtRequirementInput } from '@/types/ojt';

type OjtRequirementRow = {
  id: number;
  name: string;
  is_done: number; // SQLite has no boolean type: 0 = false, 1 = true
  due_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

function toOjtRequirement(row: OjtRequirementRow): OjtRequirement {
  return {
    id: row.id,
    name: row.name,
    isDone: row.is_done === 1,
    dueDate: row.due_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Checklist order: items still to do first; among them, the nearest due date first
 * (items with no due date after those); then the order they were added.
 */
async function listOjtRequirements(db: SQLiteDatabase): Promise<OjtRequirement[]> {
  const rows = await db.getAllAsync<OjtRequirementRow>(
    `SELECT * FROM ojt_requirements
     ORDER BY is_done, due_date IS NULL, due_date, id`
  );
  return rows.map(toOjtRequirement);
}

async function getOjtRequirement(db: SQLiteDatabase, id: number): Promise<OjtRequirement | null> {
  const row = await db.getFirstAsync<OjtRequirementRow>('SELECT * FROM ojt_requirements WHERE id = ?', [id]);
  return row ? toOjtRequirement(row) : null;
}

async function createOjtRequirement(db: SQLiteDatabase, input: OjtRequirementInput): Promise<number> {
  const now = nowIso();
  const result = await db.runAsync(
    `INSERT INTO ojt_requirements (name, is_done, due_date, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [input.name, input.isDone ? 1 : 0, input.dueDate, input.notes, now, now]
  );
  return result.lastInsertRowId;
}

async function updateOjtRequirement(db: SQLiteDatabase, id: number, input: OjtRequirementInput): Promise<void> {
  await db.runAsync(
    `UPDATE ojt_requirements SET name = ?, is_done = ?, due_date = ?, notes = ?, updated_at = ?
     WHERE id = ?`,
    [input.name, input.isDone ? 1 : 0, input.dueDate, input.notes, nowIso(), id]
  );
}

/** Deletes the item and its attachment rows (one transaction), then the files. */
async function deleteOjtRequirement(db: SQLiteDatabase, id: number): Promise<void> {
  let filePaths: string[] = [];
  await db.withTransactionAsync(async () => {
    filePaths = await deleteAttachmentsFor(db, 'ojt_requirement', id);
    await db.runAsync('DELETE FROM ojt_requirements WHERE id = ?', [id]);
  });
  deleteStoredFiles(filePaths);
}

export const ojtRequirementRepo: EntryRepo<OjtRequirement, OjtRequirementInput> = {
  list: listOjtRequirements,
  get: getOjtRequirement,
  create: createOjtRequirement,
  update: updateOjtRequirement,
  remove: deleteOjtRequirement,
};

/** One tap on the checklist: mark done / not done. */
export async function setOjtRequirementDone(db: SQLiteDatabase, id: number, isDone: boolean): Promise<void> {
  await db.runAsync('UPDATE ojt_requirements SET is_done = ?, updated_at = ? WHERE id = ?', [
    isDone ? 1 : 0,
    nowIso(),
    id,
  ]);
}

/**
 * FR-O4: fills the checklist with the common OJT requirements (Section 7.2),
 * but only if the checklist is still empty, so it never adds duplicates.
 * Call this inside a transaction. Returns how many items were added.
 */
export async function seedOjtRequirements(db: SQLiteDatabase): Promise<number> {
  const existing = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM ojt_requirements');
  if ((existing?.count ?? 0) > 0) return 0;
  for (const name of OJT_REQUIREMENT_DEFAULTS) {
    await createOjtRequirement(db, { name, isDone: false, dueDate: null, notes: null });
  }
  return OJT_REQUIREMENT_DEFAULTS.length;
}
