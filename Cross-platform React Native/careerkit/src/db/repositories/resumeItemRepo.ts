import type { SQLiteDatabase } from 'expo-sqlite';

import type { ResumeItemType } from '@/types/resume';

/**
 * Removes a deleted vault entry from every saved resume.
 * resume_items.item_id has no foreign key (it can point to five different tables),
 * so each vault repository calls this inside its delete transaction.
 * (Kept in its own file so vault repositories do not import resumeRepo, which imports them.)
 */
export async function deleteResumeItemsFor(
  db: SQLiteDatabase,
  itemType: ResumeItemType,
  itemId: number
): Promise<void> {
  await db.runAsync('DELETE FROM resume_items WHERE item_type = ? AND item_id = ?', [itemType, itemId]);
}
