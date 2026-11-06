import type { SQLiteDatabase } from 'expo-sqlite';

import { nowIso } from '@/db/client';
import { deleteAttachmentsFor } from '@/db/repositories/attachmentRepo';
import type { EntryRepo } from '@/db/repositories/types';
import type { Education, EducationInput } from '@/types/education';

type EducationRow = {
  id: number;
  school: string;
  degree: string;
  start_date: string | null;
  end_date: string | null;
  honors: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

function toEducation(row: EducationRow): Education {
  return {
    id: row.id,
    school: row.school,
    degree: row.degree,
    startDate: row.start_date,
    endDate: row.end_date,
    honors: row.honors,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Newest first: still studying (no end date) first, then latest end date. */
async function listEducation(db: SQLiteDatabase): Promise<Education[]> {
  const rows = await db.getAllAsync<EducationRow>(
    `SELECT * FROM education
     ORDER BY end_date IS NOT NULL, end_date DESC, start_date DESC, id DESC`
  );
  return rows.map(toEducation);
}

async function getEducation(db: SQLiteDatabase, id: number): Promise<Education | null> {
  const row = await db.getFirstAsync<EducationRow>('SELECT * FROM education WHERE id = ?', [id]);
  return row ? toEducation(row) : null;
}

async function createEducation(db: SQLiteDatabase, input: EducationInput): Promise<number> {
  const now = nowIso();
  const result = await db.runAsync(
    `INSERT INTO education
       (school, degree, start_date, end_date, honors, description, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [input.school, input.degree, input.startDate, input.endDate, input.honors, input.description, now, now]
  );
  return result.lastInsertRowId;
}

async function updateEducation(db: SQLiteDatabase, id: number, input: EducationInput): Promise<void> {
  await db.runAsync(
    `UPDATE education SET
       school = ?, degree = ?, start_date = ?, end_date = ?, honors = ?, description = ?, updated_at = ?
     WHERE id = ?`,
    [input.school, input.degree, input.startDate, input.endDate, input.honors, input.description, nowIso(), id]
  );
}

/** Deletes the entry and its attachments in one transaction. */
async function deleteEducation(db: SQLiteDatabase, id: number): Promise<void> {
  await db.withTransactionAsync(async () => {
    await deleteAttachmentsFor(db, 'education', id);
    await db.runAsync('DELETE FROM education WHERE id = ?', [id]);
  });
}

export const educationRepo: EntryRepo<Education, EducationInput> = {
  list: listEducation,
  get: getEducation,
  create: createEducation,
  update: updateEducation,
  remove: deleteEducation,
};
