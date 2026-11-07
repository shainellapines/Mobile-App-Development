import { format } from 'date-fns';

import { TIME_DISPLAY_FORMAT, TIME_STORE_FORMAT } from '@/constants/dates';

/**
 * Time helpers for the OJT daily time record (FR-O2). Pure functions, easy to test.
 * Times are saved as 24-hour "HH:mm" text, e.g. "08:00" and "17:30".
 */

const MINUTES_PER_HOUR = 60;

/** "08:30" → 510 (minutes after midnight). Returns null for invalid text. */
export function timeToMinutes(time: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * MINUTES_PER_HOUR + minutes;
}

/** "13:30" → a Date today at 1:30 PM (what the native time picker needs). Invalid → 8:00 AM. */
export function timeToDate(time: string): Date {
  const minutes = timeToMinutes(time) ?? 8 * MINUTES_PER_HOUR;
  const date = new Date();
  date.setHours(Math.floor(minutes / MINUTES_PER_HOUR), minutes % MINUTES_PER_HOUR, 0, 0);
  return date;
}

/** Date from the time picker → "13:30". */
export function dateToTime(date: Date): string {
  return format(date, TIME_STORE_FORMAT);
}

/** "13:30" → "1:30 PM". Empty string for invalid text. */
export function formatTime(time: string): string {
  return timeToMinutes(time) === null ? '' : format(timeToDate(time), TIME_DISPLAY_FORMAT);
}

/** Rounds to 2 decimals, e.g. 7.666… → 7.67 (FR-O2). */
export function roundHours(hours: number): number {
  return Math.round(hours * 100) / 100;
}

/**
 * Hours rendered in one day = (time out − time in − break) in hours, rounded to 2 decimals.
 * Returns null when the times are invalid, time out is not after time in,
 * or the break leaves no working time. (Overnight shifts are not supported.)
 */
export function computeLogHours(timeIn: string, timeOut: string, breakMinutes: number): number | null {
  const start = timeToMinutes(timeIn);
  const end = timeToMinutes(timeOut);
  if (start === null || end === null || end <= start) return null;
  if (!Number.isFinite(breakMinutes) || breakMinutes < 0) return null;
  const worked = end - start - breakMinutes;
  return worked > 0 ? roundHours(worked / MINUTES_PER_HOUR) : null;
}

/** 8 → "8 hrs", 1 → "1 hr", 7.5 → "7.5 hrs". */
export function formatHours(hours: number): string {
  const value = roundHours(hours);
  return `${value} ${value === 1 ? 'hr' : 'hrs'}`;
}

/** "08:00", "17:00" → "8:00 AM – 5:00 PM". */
export function formatTimeRange(timeIn: string, timeOut: string): string {
  return `${formatTime(timeIn)} – ${formatTime(timeOut)}`;
}
