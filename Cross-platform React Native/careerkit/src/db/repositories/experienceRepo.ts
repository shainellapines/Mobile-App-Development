import type { SQLiteDatabase } from 'expo-sqlite';

import { nowIso } from '@/db/client';
import { deleteAttachmentsFor } from '@/db/repositories/attachmentRepo';
import { deleteResumeItemsFor } from '@/db/repositories/resumeItemRepo';
import type { EntryRepo } from '@/db/repositories/types';
import { deleteStoredFiles } from '@/services/fileService';
import type { Experience, ExperienceInput, ExperienceType } from '@/types/experience';

/** The row exactly as SQLite returns it (snake_case columns). */
type ExperienceRow = {
  id: number;
  title: string;
  organization: string;
  type: ExperienceType;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

function toExperience(row: ExperienceRow): Experience {
  return {
    id: row.id,
    title: row.title,
    organization: row.organization,
    type: row.type,
    location: row.location,
    startDate: row.start_date,
    endDate: row.end_date,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * All experiences, newest first (FR-V1):
 * 1. Ongoing ones (no end date) come first: "end_date IS NOT NULL" is 0 for them, 1 otherwise.
 * 2. Then by end date, latest first; ties broken by start date, then newest record.
 */
export async function listExperiences(db: SQLiteDatabase): Promise<Experience[]> {
  const rows = await db.getAllAsync<ExperienceRow>(
    `SELECT * FROM experiences
     ORDER BY end_date IS NOT NULL, end_date DESC, start_date DESC, id DESC`
  );
  return rows.map(toExperience);
}

export async function getExperience(db: SQLiteDatabase, id: number): Promise<Experience | null> {
  const row = await db.getFirstAsync<ExperienceRow>('SELECT * FROM experiences WHERE id = ?', [id]);
  return row ? toExperience(row) : null;
}

/** Inserts a new experience and returns its new id. */
export async function createExperience(db: SQLiteDatabase, input: ExperienceInput): Promise<number> {
  const now = nowIso();
  const result = await db.runAsync(
    `INSERT INTO experiences
       (title, organization, type, location, start_date, end_date, description, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.title,
      input.organization,
      input.type,
      input.location,
      input.startDate,
      input.endDate,
      input.description,
      now,
      now,
    ]
  );
  return result.lastInsertRowId;
}

export async function updateExperience(
  db: SQLiteDatabase,
  id: number,
  input: ExperienceInput
): Promise<void> {
  await db.runAsync(
    `UPDATE experiences SET
       title = ?, organization = ?, type = ?, location = ?,
       start_date = ?, end_date = ?, description = ?, updated_at = ?
     WHERE id = ?`,
    [
      input.title,
      input.organization,
      input.type,
      input.location,
      input.startDate,
      input.endDate,
      input.description,
      nowIso(),
      id,
    ]
  );
}

/**
 * Deletes the record, its attachment rows, and its place in saved resumes (one transaction),
 * then the attachment files.
 */
export async function deleteExperience(db: SQLiteDatabase, id: number): Promise<void> {
  let filePaths: string[] = [];
  await db.withTransactionAsync(async () => {
    filePaths = await deleteAttachmentsFor(db, 'experience', id);
    await deleteResumeItemsFor(db, 'experience', id);
    await db.runAsync('DELETE FROM experiences WHERE id = ?', [id]);
  });
  // Only after the DB change is saved: remove the physical files (FR-D3).
  deleteStoredFiles(filePaths);
}

/** All operations in one object, so the generic hooks can use this repository. */
export const experienceRepo: EntryRepo<Experience, ExperienceInput> = {
  list: listExperiences,
  get: getExperience,
  create: createExperience,
  update: updateExperience,
  remove: deleteExperience,
};
