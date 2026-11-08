import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * The five standard operations every vault repository provides (CRUD + list).
 * T = the record type (e.g., Education), I = the input type for create/update (e.g., EducationInput).
 * Because every repository has the same shape, the generic hooks in useVaultEntries.ts work for all.
 */
export type EntryRepo<T, I> = {
  list: (db: SQLiteDatabase) => Promise<T[]>;
  get: (db: SQLiteDatabase, id: number) => Promise<T | null>;
  /** Returns the new record's id. */
  create: (db: SQLiteDatabase, input: I) => Promise<number>;
  update: (db: SQLiteDatabase, id: number, input: I) => Promise<void>;
  remove: (db: SQLiteDatabase, id: number) => Promise<void>;
};
