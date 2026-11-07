import type { SQLiteDatabase } from 'expo-sqlite';

import { getOjtInfo } from '@/db/repositories/ojtRepo';
import { getProfile } from '@/db/repositories/profileRepo';
import { requirementRepo } from '@/db/repositories/requirementRepo';
import type { ApplicationStatus } from '@/types/application';
import type { OjtInfo } from '@/types/ojt';
import type { Profile } from '@/types/profile';
import type { Requirement } from '@/types/requirement';

export type VaultCounts = {
  education: number;
  experiences: number;
  projects: number;
  skills: number;
  certifications: number;
  resumes: number;
};

/** Everything the Dashboard needs, read in one go (FR-H1, H2). */
export type DashboardData = {
  profile: Profile | null;
  counts: VaultCounts;
  /** All requirements: their status depends on today's date, so it is worked out in JavaScript. */
  requirements: Requirement[];
  applicationCounts: Partial<Record<ApplicationStatus, number>>;
  ojtInfo: OjtInfo | null;
  /** Only the two columns the progress calculation needs. */
  ojtLogs: { logDate: string; hours: number }[];
};

/** One query with sub-selects: counts the rows of six tables at once. */
async function getVaultCounts(db: SQLiteDatabase): Promise<VaultCounts> {
  const row = await db.getFirstAsync<VaultCounts>(
    `SELECT
       (SELECT COUNT(*) FROM education)      AS education,
       (SELECT COUNT(*) FROM experiences)    AS experiences,
       (SELECT COUNT(*) FROM projects)       AS projects,
       (SELECT COUNT(*) FROM skills)         AS skills,
       (SELECT COUNT(*) FROM certifications) AS certifications,
       (SELECT COUNT(*) FROM resumes)        AS resumes`
  );
  return row ?? { education: 0, experiences: 0, projects: 0, skills: 0, certifications: 0, resumes: 0 };
}

/** GROUP BY gives one row per status, e.g. { applied: 4, interview: 1 }. Missing = 0. */
async function getApplicationCounts(db: SQLiteDatabase): Promise<Partial<Record<ApplicationStatus, number>>> {
  const rows = await db.getAllAsync<{ status: ApplicationStatus; count: number }>(
    'SELECT status, COUNT(*) AS count FROM applications GROUP BY status'
  );
  return Object.fromEntries(rows.map((r) => [r.status, r.count]));
}

export async function getDashboardData(db: SQLiteDatabase): Promise<DashboardData> {
  const [profile, counts, requirements, applicationCounts, ojtInfo, ojtLogs] = await Promise.all([
    getProfile(db),
    getVaultCounts(db),
    requirementRepo.list(db),
    getApplicationCounts(db),
    getOjtInfo(db),
    db.getAllAsync<{ logDate: string; hours: number }>('SELECT log_date AS logDate, hours FROM ojt_logs'),
  ]);
  return { profile, counts, requirements, applicationCounts, ojtInfo, ojtLogs };
}
