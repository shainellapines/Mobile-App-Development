import type { SQLiteDatabase } from 'expo-sqlite';

import { nowIso } from '@/db/client';
import type { Profile, ProfileInput } from '@/types/profile';

/** The row exactly as SQLite returns it (snake_case columns). */
type ProfileRow = {
  id: 1;
  full_name: string;
  headline: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  summary: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  photo_uri: string | null;
  created_at: string;
  updated_at: string;
};

function toProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    headline: row.headline,
    email: row.email,
    phone: row.phone,
    address: row.address,
    summary: row.summary,
    linkedinUrl: row.linkedin_url,
    portfolioUrl: row.portfolio_url,
    photoUri: row.photo_uri,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Returns the profile, or null if the user has never saved one. */
export async function getProfile(db: SQLiteDatabase): Promise<Profile | null> {
  const row = await db.getFirstAsync<ProfileRow>('SELECT * FROM profile WHERE id = 1');
  return row ? toProfile(row) : null;
}

/**
 * Creates the profile on first save, or updates it afterwards ("upsert").
 * ON CONFLICT(id) means: if row 1 already exists, update it instead of inserting.
 * created_at is only set on the first insert; updated_at changes every time.
 */
export async function saveProfile(db: SQLiteDatabase, input: ProfileInput): Promise<Profile> {
  const now = nowIso();
  await db.runAsync(
    `INSERT INTO profile (
       id, full_name, headline, email, phone, address, summary,
       linkedin_url, portfolio_url, photo_uri, created_at, updated_at
     ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       full_name = excluded.full_name,
       headline = excluded.headline,
       email = excluded.email,
       phone = excluded.phone,
       address = excluded.address,
       summary = excluded.summary,
       linkedin_url = excluded.linkedin_url,
       portfolio_url = excluded.portfolio_url,
       photo_uri = excluded.photo_uri,
       updated_at = excluded.updated_at`,
    [
      input.fullName,
      input.headline,
      input.email,
      input.phone,
      input.address,
      input.summary,
      input.linkedinUrl,
      input.portfolioUrl,
      input.photoUri,
      now,
      now,
    ]
  );

  const saved = await getProfile(db);
  if (!saved) throw new Error('Profile was not saved');
  return saved;
}
