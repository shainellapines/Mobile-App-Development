import type { SQLiteDatabase } from 'expo-sqlite';

import { nowIso } from '@/db/client';
import { certificationRepo } from '@/db/repositories/certificationRepo';
import { educationRepo } from '@/db/repositories/educationRepo';
import { experienceRepo } from '@/db/repositories/experienceRepo';
import { getProfile } from '@/db/repositories/profileRepo';
import { projectRepo } from '@/db/repositories/projectRepo';
import { skillRepo } from '@/db/repositories/skillRepo';
import type { EntryRepo } from '@/db/repositories/types';
import type {
  Resume,
  ResumeContent,
  ResumeInput,
  ResumeItem,
  ResumeItemType,
  ResumeTemplate,
} from '@/types/resume';

type ResumeRow = {
  id: number;
  title: string;
  template: ResumeTemplate;
  target_role: string | null;
  pdf_uri: string | null;
  created_at: string;
  updated_at: string;
};

type ResumeItemRow = {
  item_type: ResumeItemType;
  item_id: number;
};

function toResume(row: ResumeRow, items: ResumeItem[]): Resume {
  return {
    id: row.id,
    title: row.title,
    template: row.template,
    targetRole: row.target_role,
    pdfUri: row.pdf_uri,
    items,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getItems(db: SQLiteDatabase, resumeId: number): Promise<ResumeItem[]> {
  const rows = await db.getAllAsync<ResumeItemRow>(
    'SELECT item_type, item_id FROM resume_items WHERE resume_id = ? ORDER BY item_type, sort_order',
    [resumeId]
  );
  return rows.map((r) => ({ itemType: r.item_type, itemId: r.item_id }));
}

/**
 * Saves the selected items. sort_order counts up WITHIN each section (0, 1, 2 ... per item type),
 * which is all we need because each section of the resume is ordered on its own.
 */
async function insertItems(db: SQLiteDatabase, resumeId: number, items: ResumeItem[]): Promise<void> {
  const nextOrder: Partial<Record<ResumeItemType, number>> = {};
  for (const item of items) {
    const order = nextOrder[item.itemType] ?? 0;
    nextOrder[item.itemType] = order + 1;
    await db.runAsync(
      'INSERT INTO resume_items (resume_id, item_type, item_id, sort_order) VALUES (?, ?, ?, ?)',
      [resumeId, item.itemType, item.itemId, order]
    );
  }
}

/** Most recently edited first. */
async function listResumes(db: SQLiteDatabase): Promise<Resume[]> {
  const rows = await db.getAllAsync<ResumeRow>('SELECT * FROM resumes ORDER BY updated_at DESC, id DESC');
  const resumes: Resume[] = [];
  for (const row of rows) resumes.push(toResume(row, await getItems(db, row.id)));
  return resumes;
}

async function getResume(db: SQLiteDatabase, id: number): Promise<Resume | null> {
  const row = await db.getFirstAsync<ResumeRow>('SELECT * FROM resumes WHERE id = ?', [id]);
  return row ? toResume(row, await getItems(db, id)) : null;
}

/** Inserts the resume and its items in one transaction. Returns the new id. */
async function createResume(db: SQLiteDatabase, input: ResumeInput): Promise<number> {
  let id = 0;
  await db.withTransactionAsync(async () => {
    const now = nowIso();
    const result = await db.runAsync(
      'INSERT INTO resumes (title, template, target_role, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [input.title, input.template, input.targetRole, now, now]
    );
    id = result.lastInsertRowId;
    await insertItems(db, id, input.items);
  });
  return id;
}

/** Updates the resume and REPLACES its item list (delete all, insert the new selection). */
async function updateResume(db: SQLiteDatabase, id: number, input: ResumeInput): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      'UPDATE resumes SET title = ?, template = ?, target_role = ?, updated_at = ? WHERE id = ?',
      [input.title, input.template, input.targetRole, nowIso(), id]
    );
    await db.runAsync('DELETE FROM resume_items WHERE resume_id = ?', [id]);
    await insertItems(db, id, input.items);
  });
}

/**
 * Deletes the resume. Its resume_items go too (ON DELETE CASCADE), and applications that used it
 * keep their record but lose the link (ON DELETE SET NULL). The PDF folder is removed by the hook.
 */
async function deleteResume(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM resumes WHERE id = ?', [id]);
}

export const resumeRepo: EntryRepo<Resume, ResumeInput> = {
  list: listResumes,
  get: getResume,
  create: createResume,
  update: updateResume,
  remove: deleteResume,
};

/** Copies a resume version (FR-R5). The copy has no PDF yet. Returns the new id. */
export async function duplicateResume(db: SQLiteDatabase, id: number): Promise<number> {
  const original = await getResume(db, id);
  if (!original) throw new Error('Resume not found');
  return createResume(db, {
    title: `${original.title} (copy)`,
    template: original.template,
    targetRole: original.targetRole,
    items: original.items,
  });
}

/** Remembers where the last exported PDF is (does not change updated_at). */
export async function setResumePdf(db: SQLiteDatabase, id: number, path: string | null): Promise<void> {
  await db.runAsync('UPDATE resumes SET pdf_uri = ? WHERE id = ?', [path, id]);
}

/** Picks the selected records out of a full list, in the resume's order. */
function pickInOrder<T extends { id: number }>(all: T[], items: ResumeItem[], type: ResumeItemType): T[] {
  const byId = new Map(all.map((record) => [record.id, record]));
  return items
    .filter((item) => item.itemType === type)
    .map((item) => byId.get(item.itemId))
    .filter((record): record is T => record !== undefined); // skip entries deleted since saving
}

/** Loads the profile and every selected entry, ready for a template (FR-R1, R2). */
export async function getResumeContent(db: SQLiteDatabase, resume: Resume): Promise<ResumeContent> {
  const [profile, education, experience, projects, skills, certifications] = await Promise.all([
    getProfile(db),
    educationRepo.list(db),
    experienceRepo.list(db),
    projectRepo.list(db),
    skillRepo.list(db),
    certificationRepo.list(db),
  ]);

  return {
    profile,
    targetRole: resume.targetRole,
    education: pickInOrder(education, resume.items, 'education'),
    experience: pickInOrder(experience, resume.items, 'experience'),
    projects: pickInOrder(projects, resume.items, 'project'),
    skills: pickInOrder(skills, resume.items, 'skill'),
    certifications: pickInOrder(certifications, resume.items, 'certification'),
  };
}
