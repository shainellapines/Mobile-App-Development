import type { SQLiteDatabase } from 'expo-sqlite';

import { nowIso } from '@/db/client';
import type { Attachment, AttachmentOwnerType, NewAttachment } from '@/types/attachment';

type AttachmentRow = {
  id: number;
  owner_type: AttachmentOwnerType;
  owner_id: number;
  file_uri: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
  updated_at: string;
};

function toAttachment(row: AttachmentRow): Attachment {
  return {
    id: row.id,
    ownerType: row.owner_type,
    ownerId: row.owner_id,
    fileUri: row.file_uri,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** All files attached to one record, oldest first (the order they were added). */
export async function listAttachments(
  db: SQLiteDatabase,
  ownerType: AttachmentOwnerType,
  ownerId: number
): Promise<Attachment[]> {
  const rows = await db.getAllAsync<AttachmentRow>(
    'SELECT * FROM attachments WHERE owner_type = ? AND owner_id = ? ORDER BY id',
    [ownerType, ownerId]
  );
  return rows.map(toAttachment);
}

export async function createAttachment(db: SQLiteDatabase, input: NewAttachment): Promise<number> {
  const now = nowIso();
  const result = await db.runAsync(
    `INSERT INTO attachments
       (owner_type, owner_id, file_uri, file_name, mime_type, size_bytes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [input.ownerType, input.ownerId, input.fileUri, input.fileName, input.mimeType, input.sizeBytes, now, now]
  );
  return result.lastInsertRowId;
}

/** Deletes one attachment row and returns its file path (so the caller can delete the file). */
export async function deleteAttachment(db: SQLiteDatabase, id: number): Promise<string | null> {
  const row = await db.getFirstAsync<{ file_uri: string }>('SELECT file_uri FROM attachments WHERE id = ?', [id]);
  await db.runAsync('DELETE FROM attachments WHERE id = ?', [id]);
  return row?.file_uri ?? null;
}

/**
 * Deletes every attachment row of one record and returns their file paths.
 * Other repositories call this INSIDE their delete transaction, because the attachments table
 * has no foreign key (one table serves many owners), so SQLite cannot cascade for us.
 * The caller deletes the physical files AFTER the transaction succeeds (see deleteStoredFiles):
 * files cannot be "rolled back", so we only remove them once the DB change is final.
 */
export async function deleteAttachmentsFor(
  db: SQLiteDatabase,
  ownerType: AttachmentOwnerType,
  ownerId: number
): Promise<string[]> {
  const rows = await db.getAllAsync<{ file_uri: string }>(
    'SELECT file_uri FROM attachments WHERE owner_type = ? AND owner_id = ?',
    [ownerType, ownerId]
  );
  await db.runAsync('DELETE FROM attachments WHERE owner_type = ? AND owner_id = ?', [ownerType, ownerId]);
  return rows.map((r) => r.file_uri);
}
