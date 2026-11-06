import type { SQLiteDatabase } from 'expo-sqlite';

export type DbInfo = {
  schemaVersion: number;
  tableCount: number;
  foreignKeysOn: boolean;
};

/**
 * Reads basic facts about the database. Used to prove the DB layer works (step 1.2)
 * and later by the Settings "About" section.
 */
export async function getDbInfo(db: SQLiteDatabase): Promise<DbInfo> {
  const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const fk = await db.getFirstAsync<{ foreign_keys: number }>('PRAGMA foreign_keys');
  // Count our own tables, ignoring SQLite's internal ones (e.g., sqlite_sequence).
  const tables = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) AS count FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
  );

  return {
    schemaVersion: version?.user_version ?? 0,
    tableCount: tables?.count ?? 0,
    foreignKeysOn: fk?.foreign_keys === 1,
  };
}
