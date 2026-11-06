import type { SQLiteDatabase } from 'expo-sqlite';

import type { AttachmentOwnerType } from '@/types/attachment';

/**
 * Deletes the attachment rows that belong to one record.
 * Called by other repositories inside their delete transaction, because the attachments
 * table has no foreign key (one table serves many owners), so SQLite cannot cascade for us.
 * TODO (step 1.7): also delete the physical files via fileService.
 */
export async function deleteAttachmentsFor(
  db: SQLiteDatabase,
  ownerType: AttachmentOwnerType,
  ownerId: number
): Promise<void> {
  await db.runAsync('DELETE FROM attachments WHERE owner_type = ? AND owner_id = ?', [ownerType, ownerId]);
}
