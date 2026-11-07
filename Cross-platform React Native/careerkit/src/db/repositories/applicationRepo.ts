import type { SQLiteDatabase } from 'expo-sqlite';

import { nowIso } from '@/db/client';
import type { EntryRepo } from '@/db/repositories/types';
import type { Application, ApplicationChannel, ApplicationInput, ApplicationStatus } from '@/types/application';

type ApplicationRow = {
  id: number;
  company: string;
  position: string;
  date_applied: string;
  channel: ApplicationChannel | null;
  status: ApplicationStatus;
  resume_id: number | null;
  resume_title: string | null; // from the LEFT JOIN below
  salary_offer: string | null;
  next_step_date: string | null;
  notes: string | null;
  notification_id: string | null;
  created_at: string;
  updated_at: string;
};

function toApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    company: row.company,
    position: row.position,
    dateApplied: row.date_applied,
    channel: row.channel,
    status: row.status,
    resumeId: row.resume_id,
    resumeTitle: row.resume_title,
    salaryOffer: row.salary_offer,
    nextStepDate: row.next_step_date,
    notes: row.notes,
    notificationId: row.notification_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * LEFT JOIN brings in the linked resume's title in the same query.
 * "LEFT" keeps applications that have no resume (resume_title is then NULL).
 */
const SELECT_WITH_RESUME = `
  SELECT a.*, r.title AS resume_title
  FROM applications a
  LEFT JOIN resumes r ON r.id = a.resume_id`;

/** Most recent applications first (FR-A1). */
async function listApplications(db: SQLiteDatabase): Promise<Application[]> {
  const rows = await db.getAllAsync<ApplicationRow>(
    `${SELECT_WITH_RESUME} ORDER BY a.date_applied DESC, a.id DESC`
  );
  return rows.map(toApplication);
}

async function getApplication(db: SQLiteDatabase, id: number): Promise<Application | null> {
  const row = await db.getFirstAsync<ApplicationRow>(`${SELECT_WITH_RESUME} WHERE a.id = ?`, [id]);
  return row ? toApplication(row) : null;
}

async function createApplication(db: SQLiteDatabase, input: ApplicationInput): Promise<number> {
  const now = nowIso();
  const result = await db.runAsync(
    `INSERT INTO applications
       (company, position, date_applied, channel, status, resume_id, salary_offer, next_step_date, notes,
        created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.company,
      input.position,
      input.dateApplied,
      input.channel,
      input.status,
      input.resumeId,
      input.salaryOffer,
      input.nextStepDate,
      input.notes,
      now,
      now,
    ]
  );
  return result.lastInsertRowId;
}

async function updateApplication(db: SQLiteDatabase, id: number, input: ApplicationInput): Promise<void> {
  await db.runAsync(
    `UPDATE applications SET
       company = ?, position = ?, date_applied = ?, channel = ?, status = ?, resume_id = ?,
       salary_offer = ?, next_step_date = ?, notes = ?, updated_at = ?
     WHERE id = ?`,
    [
      input.company,
      input.position,
      input.dateApplied,
      input.channel,
      input.status,
      input.resumeId,
      input.salaryOffer,
      input.nextStepDate,
      input.notes,
      nowIso(),
      id,
    ]
  );
}

/** Applications have no attachments, so a plain delete is enough. */
async function deleteApplication(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM applications WHERE id = ?', [id]);
}

export const applicationRepo: EntryRepo<Application, ApplicationInput> = {
  list: listApplications,
  get: getApplication,
  create: createApplication,
  update: updateApplication,
  remove: deleteApplication,
};

/** Quick status change from the detail screen (FR-A2). */
export async function setApplicationStatus(
  db: SQLiteDatabase,
  id: number,
  status: ApplicationStatus
): Promise<void> {
  await db.runAsync('UPDATE applications SET status = ?, updated_at = ? WHERE id = ?', [status, nowIso(), id]);
}

/** Remembers which scheduled reminder belongs to an application (null = none). */
export async function setApplicationNotificationId(
  db: SQLiteDatabase,
  id: number,
  notificationId: string | null
): Promise<void> {
  await db.runAsync('UPDATE applications SET notification_id = ? WHERE id = ?', [notificationId, id]);
}
