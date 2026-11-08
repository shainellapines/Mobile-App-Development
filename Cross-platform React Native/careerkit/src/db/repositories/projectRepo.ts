import type { SQLiteDatabase } from 'expo-sqlite';

import { nowIso } from '@/db/client';
import { deleteAttachmentsFor } from '@/db/repositories/attachmentRepo';
import { deleteResumeItemsFor } from '@/db/repositories/resumeItemRepo';
import type { EntryRepo } from '@/db/repositories/types';
import { deleteStoredFiles } from '@/services/fileService';
import type { Project, ProjectInput } from '@/types/project';

type ProjectRow = {
  id: number;
  name: string;
  role: string | null;
  tech_used: string | null;
  link: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    techUsed: row.tech_used,
    link: row.link,
    startDate: row.start_date,
    endDate: row.end_date,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Newest first: ongoing projects (no end date) first, then latest end date. */
async function listProjects(db: SQLiteDatabase): Promise<Project[]> {
  const rows = await db.getAllAsync<ProjectRow>(
    `SELECT * FROM projects
     ORDER BY end_date IS NOT NULL, end_date DESC, start_date DESC, id DESC`
  );
  return rows.map(toProject);
}

async function getProject(db: SQLiteDatabase, id: number): Promise<Project | null> {
  const row = await db.getFirstAsync<ProjectRow>('SELECT * FROM projects WHERE id = ?', [id]);
  return row ? toProject(row) : null;
}

async function createProject(db: SQLiteDatabase, input: ProjectInput): Promise<number> {
  const now = nowIso();
  const result = await db.runAsync(
    `INSERT INTO projects
       (name, role, tech_used, link, start_date, end_date, description, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name,
      input.role,
      input.techUsed,
      input.link,
      input.startDate,
      input.endDate,
      input.description,
      now,
      now,
    ]
  );
  return result.lastInsertRowId;
}

async function updateProject(db: SQLiteDatabase, id: number, input: ProjectInput): Promise<void> {
  await db.runAsync(
    `UPDATE projects SET
       name = ?, role = ?, tech_used = ?, link = ?,
       start_date = ?, end_date = ?, description = ?, updated_at = ?
     WHERE id = ?`,
    [
      input.name,
      input.role,
      input.techUsed,
      input.link,
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
async function deleteProject(db: SQLiteDatabase, id: number): Promise<void> {
  let filePaths: string[] = [];
  await db.withTransactionAsync(async () => {
    filePaths = await deleteAttachmentsFor(db, 'project', id);
    await deleteResumeItemsFor(db, 'project', id);
    await db.runAsync('DELETE FROM projects WHERE id = ?', [id]);
  });
  // Only after the DB change is saved: remove the physical files (FR-D3).
  deleteStoredFiles(filePaths);
}

export const projectRepo: EntryRepo<Project, ProjectInput> = {
  list: listProjects,
  get: getProject,
  create: createProject,
  update: updateProject,
  remove: deleteProject,
};
