import type { SQLiteDatabase } from 'expo-sqlite';

/** Keys used in the key-value `settings` table. */
export const SETTING_KEYS = {
  onboardingDone: 'onboarding_done',
} as const;

type SettingKey = (typeof SETTING_KEYS)[keyof typeof SETTING_KEYS];

/** Reads one setting (null if it was never saved). */
export async function getSetting(db: SQLiteDatabase, key: SettingKey): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string | null }>('SELECT value FROM settings WHERE key = ?', [key]);
  return row?.value ?? null;
}

/** Saves one setting (insert, or replace the old value). */
export async function setSetting(db: SQLiteDatabase, key: SettingKey, value: string): Promise<void> {
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [key, value]
  );
}
