import type { SQLiteDatabase } from 'expo-sqlite';

import { MIGRATIONS } from './migrations';

/** File name of the local database (stored on the device only). */
export const DATABASE_NAME = 'careerkit.db';

/**
 * Runs once when the app opens the database (passed to <SQLiteProvider onInit>).
 * 1. Turns on foreign keys (SQLite has them OFF by default, per connection).
 * 2. Brings the schema up to date by running any pending migrations.
 */
export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  // Must run outside a transaction, so it goes first.
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await runMigrations(db);
}

async function runMigrations(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = row?.user_version ?? 0;

  const pending = MIGRATIONS.filter((m) => m.version > currentVersion).sort(
    (a, b) => a.version - b.version
  );

  for (const migration of pending) {
    // A transaction means a migration either fully succeeds or changes nothing.
    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.sql);
      // PRAGMA cannot take "?" parameters; the version is our own constant, not user input.
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    });
    console.log(`[db] migrated to v${migration.version}: ${migration.description}`);
  }
}

/** Small helper so every repository stamps timestamps the same way. */
export function nowIso(): string {
  return new Date().toISOString();
}
