import type { SQLiteDatabase } from 'expo-sqlite';

import { nowIso } from '@/db/client';
import { deleteAttachmentsFor } from '@/db/repositories/attachmentRepo';
import type { EntryRepo } from '@/db/repositories/types';
import { deleteStoredFiles } from '@/services/fileService';
import type { Requirement, RequirementCategory, RequirementInput } from '@/types/requirement';

type RequirementRow = {
  id: number;
  name: string;
  category: RequirementCategory;
  reference_no: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  status_override: 'not_yet_obtained' | null;
  notes: string | null;
  reminder_days_before: number;
  notification_id: string | null;
  created_at: string;
  updated_at: string;
};

function toRequirement(row: RequirementRow): Requirement {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    referenceNo: row.reference_no,
    issueDate: row.issue_date,
    expiryDate: row.expiry_date,
    statusOverride: row.status_override,
    notes: row.notes,
    reminderDaysBefore: row.reminder_days_before,
    notificationId: row.notification_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * All requirements A–Z. The screen re-sorts them by urgency (expired first), because
 * status depends on TODAY's date and is calculated in JavaScript, not stored in SQL.
 */
async function listRequirements(db: SQLiteDatabase): Promise<Requirement[]> {
  const rows = await db.getAllAsync<RequirementRow>('SELECT * FROM requirements ORDER BY name COLLATE NOCASE');
  return rows.map(toRequirement);
}

async function getRequirement(db: SQLiteDatabase, id: number): Promise<Requirement | null> {
  const row = await db.getFirstAsync<RequirementRow>('SELECT * FROM requirements WHERE id = ?', [id]);
  return row ? toRequirement(row) : null;
}

async function createRequirement(db: SQLiteDatabase, input: RequirementInput): Promise<number> {
  const now = nowIso();
  const result = await db.runAsync(
    `INSERT INTO requirements
       (name, category, reference_no, issue_date, expiry_date, status_override, notes,
        reminder_days_before, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name,
      input.category,
      input.referenceNo,
      input.issueDate,
      input.expiryDate,
      input.statusOverride,
      input.notes,
      input.reminderDaysBefore,
      now,
      now,
    ]
  );
  return result.lastInsertRowId;
}

async function updateRequirement(db: SQLiteDatabase, id: number, input: RequirementInput): Promise<void> {
  await db.runAsync(
    `UPDATE requirements SET
       name = ?, category = ?, reference_no = ?, issue_date = ?, expiry_date = ?,
       status_override = ?, notes = ?, reminder_days_before = ?, updated_at = ?
     WHERE id = ?`,
    [
      input.name,
      input.category,
      input.referenceNo,
      input.issueDate,
      input.expiryDate,
      input.statusOverride,
      input.notes,
      input.reminderDaysBefore,
      nowIso(),
      id,
    ]
  );
}

/** Deletes the requirement and its attachment rows (one transaction), then the files. */
async function deleteRequirement(db: SQLiteDatabase, id: number): Promise<void> {
  let filePaths: string[] = [];
  await db.withTransactionAsync(async () => {
    filePaths = await deleteAttachmentsFor(db, 'requirement', id);
    await db.runAsync('DELETE FROM requirements WHERE id = ?', [id]);
  });
  deleteStoredFiles(filePaths);
}

export const requirementRepo: EntryRepo<Requirement, RequirementInput> = {
  list: listRequirements,
  get: getRequirement,
  create: createRequirement,
  update: updateRequirement,
  remove: deleteRequirement,
};
