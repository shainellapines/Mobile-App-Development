import type { SQLiteDatabase } from 'expo-sqlite';

import { nowIso } from '@/db/client';
import { seedOjtRequirements } from '@/db/repositories/ojtRequirementRepo';
import type { EntryRepo } from '@/db/repositories/types';
import type { OjtInfo, OjtInfoInput, OjtLog, OjtLogInput } from '@/types/ojt';
import { computeLogHours } from '@/utils/ojtHours';

// ── OJT setup (single row, id = 1) ──────────────────────────────────────────

type OjtInfoRow = {
  id: 1;
  company: string | null;
  supervisor: string | null;
  required_hours: number;
  start_date: string | null;
  target_end_date: string | null;
  created_at: string;
  updated_at: string;
};

function toOjtInfo(row: OjtInfoRow): OjtInfo {
  return {
    company: row.company,
    supervisor: row.supervisor,
    requiredHours: row.required_hours,
    startDate: row.start_date,
    targetEndDate: row.target_end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Returns the OJT setup, or null if the user has not set up their OJT yet. */
export async function getOjtInfo(db: SQLiteDatabase): Promise<OjtInfo | null> {
  const row = await db.getFirstAsync<OjtInfoRow>('SELECT * FROM ojt_info WHERE id = 1');
  return row ? toOjtInfo(row) : null;
}

/**
 * Saves the OJT setup ("upsert", same idea as the profile). On the FIRST setup it also
 * fills the OJT requirements checklist with defaults (FR-O4). Both happen in one transaction.
 * Returns how many default requirements were added (0 when editing an existing setup).
 */
export async function saveOjtInfo(db: SQLiteDatabase, input: OjtInfoInput): Promise<number> {
  let seeded = 0;
  await db.withTransactionAsync(async () => {
    const isFirstSetup = (await getOjtInfo(db)) === null;
    const now = nowIso();
    await db.runAsync(
      `INSERT INTO ojt_info (id, company, supervisor, required_hours, start_date, target_end_date, created_at, updated_at)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         company = excluded.company,
         supervisor = excluded.supervisor,
         required_hours = excluded.required_hours,
         start_date = excluded.start_date,
         target_end_date = excluded.target_end_date,
         updated_at = excluded.updated_at`,
      [input.company, input.supervisor, input.requiredHours, input.startDate, input.targetEndDate, now, now]
    );
    if (isFirstSetup) seeded = await seedOjtRequirements(db);
  });
  return seeded;
}

// ── Daily time records ──────────────────────────────────────────────────────

type OjtLogRow = {
  id: number;
  log_date: string;
  time_in: string;
  time_out: string;
  break_minutes: number;
  hours: number;
  tasks: string | null;
  created_at: string;
  updated_at: string;
};

function toOjtLog(row: OjtLogRow): OjtLog {
  return {
    id: row.id,
    logDate: row.log_date,
    timeIn: row.time_in,
    timeOut: row.time_out,
    breakMinutes: row.break_minutes,
    hours: row.hours,
    tasks: row.tasks,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * The repository calculates the hours itself, so the stored number always matches the times.
 * The form already validates the times; this is a last safety check.
 */
function hoursFor(input: OjtLogInput): number {
  const hours = computeLogHours(input.timeIn, input.timeOut, input.breakMinutes);
  if (hours === null) throw new Error('Invalid OJT log times');
  return hours;
}

/** Newest day first (FR-O2). */
async function listOjtLogs(db: SQLiteDatabase): Promise<OjtLog[]> {
  const rows = await db.getAllAsync<OjtLogRow>('SELECT * FROM ojt_logs ORDER BY log_date DESC, time_in DESC');
  return rows.map(toOjtLog);
}

async function getOjtLog(db: SQLiteDatabase, id: number): Promise<OjtLog | null> {
  const row = await db.getFirstAsync<OjtLogRow>('SELECT * FROM ojt_logs WHERE id = ?', [id]);
  return row ? toOjtLog(row) : null;
}

async function createOjtLog(db: SQLiteDatabase, input: OjtLogInput): Promise<number> {
  const now = nowIso();
  const result = await db.runAsync(
    `INSERT INTO ojt_logs (log_date, time_in, time_out, break_minutes, hours, tasks, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [input.logDate, input.timeIn, input.timeOut, input.breakMinutes, hoursFor(input), input.tasks, now, now]
  );
  return result.lastInsertRowId;
}

async function updateOjtLog(db: SQLiteDatabase, id: number, input: OjtLogInput): Promise<void> {
  await db.runAsync(
    `UPDATE ojt_logs SET log_date = ?, time_in = ?, time_out = ?, break_minutes = ?, hours = ?, tasks = ?,
       updated_at = ?
     WHERE id = ?`,
    [input.logDate, input.timeIn, input.timeOut, input.breakMinutes, hoursFor(input), input.tasks, nowIso(), id]
  );
}

/** Logs have no attachments, so a plain delete is enough. */
async function deleteOjtLog(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM ojt_logs WHERE id = ?', [id]);
}

export const ojtLogRepo: EntryRepo<OjtLog, OjtLogInput> = {
  list: listOjtLogs,
  get: getOjtLog,
  create: createOjtLog,
  update: updateOjtLog,
  remove: deleteOjtLog,
};
