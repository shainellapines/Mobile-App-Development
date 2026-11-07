import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Every table, CHILDREN FIRST: with foreign keys on, rows that point to another table
 * (resume_items, applications → resumes) must be removed before the rows they point to.
 * These are fixed names written by us (not user input), so building the SQL text is safe here.
 */
export const ALL_TABLES_CHILD_FIRST = [
  'resume_items',
  'applications',
  'attachments',
  'resumes',
  'requirements',
  'ojt_logs',
  'ojt_requirements',
  'ojt_info',
  'education',
  'experiences',
  'projects',
  'skills',
  'certifications',
  'profile',
  'settings',
] as const;

/**
 * Reset all data (FR-L3): empties every table in ONE transaction (all or nothing).
 * The tables themselves stay, so the app keeps working right away with an empty vault.
 * sqlite_sequence holds the AUTOINCREMENT counters; clearing it makes new ids start at 1 again.
 */
export async function clearAllTables(db: SQLiteDatabase): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const table of ALL_TABLES_CHILD_FIRST) {
      await db.execAsync(`DELETE FROM ${table}`);
    }
    await db.execAsync('DELETE FROM sqlite_sequence');
  });
}
