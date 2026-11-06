import type { SQLiteDatabase } from 'expo-sqlite';

import { nowIso } from '@/db/client';
import { deleteAttachmentsFor } from '@/db/repositories/attachmentRepo';
import { deleteResumeItemsFor } from '@/db/repositories/resumeItemRepo';
import type { EntryRepo } from '@/db/repositories/types';
import { deleteStoredFiles } from '@/services/fileService';
import type { Certification, CertificationInput } from '@/types/certification';

type CertificationRow = {
  id: number;
  name: string;
  issuer: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  created_at: string;
  updated_at: string;
};

function toCertification(row: CertificationRow): Certification {
  return {
    id: row.id,
    name: row.name,
    issuer: row.issuer,
    issueDate: row.issue_date,
    expiryDate: row.expiry_date,
    credentialId: row.credential_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Newest first by issue date; certificates without an issue date go last. */
async function listCertifications(db: SQLiteDatabase): Promise<Certification[]> {
  const rows = await db.getAllAsync<CertificationRow>(
    `SELECT * FROM certifications
     ORDER BY issue_date IS NULL, issue_date DESC, id DESC`
  );
  return rows.map(toCertification);
}

async function getCertification(db: SQLiteDatabase, id: number): Promise<Certification | null> {
  const row = await db.getFirstAsync<CertificationRow>('SELECT * FROM certifications WHERE id = ?', [id]);
  return row ? toCertification(row) : null;
}

async function createCertification(db: SQLiteDatabase, input: CertificationInput): Promise<number> {
  const now = nowIso();
  const result = await db.runAsync(
    `INSERT INTO certifications
       (name, issuer, issue_date, expiry_date, credential_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [input.name, input.issuer, input.issueDate, input.expiryDate, input.credentialId, now, now]
  );
  return result.lastInsertRowId;
}

async function updateCertification(
  db: SQLiteDatabase,
  id: number,
  input: CertificationInput
): Promise<void> {
  await db.runAsync(
    `UPDATE certifications SET
       name = ?, issuer = ?, issue_date = ?, expiry_date = ?, credential_id = ?, updated_at = ?
     WHERE id = ?`,
    [input.name, input.issuer, input.issueDate, input.expiryDate, input.credentialId, nowIso(), id]
  );
}

/**
 * Deletes the record, its attachment rows, and its place in saved resumes (one transaction),
 * then the attachment files.
 */
async function deleteCertification(db: SQLiteDatabase, id: number): Promise<void> {
  let filePaths: string[] = [];
  await db.withTransactionAsync(async () => {
    filePaths = await deleteAttachmentsFor(db, 'certification', id);
    await deleteResumeItemsFor(db, 'certification', id);
    await db.runAsync('DELETE FROM certifications WHERE id = ?', [id]);
  });
  // Only after the DB change is saved: remove the physical files (FR-D3).
  deleteStoredFiles(filePaths);
}

export const certificationRepo: EntryRepo<Certification, CertificationInput> = {
  list: listCertifications,
  get: getCertification,
  create: createCertification,
  update: updateCertification,
  remove: deleteCertification,
};
