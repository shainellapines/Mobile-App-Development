import { format, isValid, parseISO } from 'date-fns';

import { DISPLAY_DATE_FORMAT, ISO_DATE_FORMAT } from '@/constants/dates';

/** Date object → "2026-11-06" (the format stored in the database). */
export function toIsoDate(date: Date): string {
  return format(date, ISO_DATE_FORMAT);
}

/** "2026-11-06" → Date at local midnight. Returns null for empty or invalid text. */
export function parseIsoDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const date = parseISO(iso);
  return isValid(date) ? date : null;
}

/** "2026-11-06" → "Nov 6, 2026". Empty string if there is no date. */
export function formatDate(iso: string | null | undefined): string {
  const date = parseIsoDate(iso);
  return date ? format(date, DISPLAY_DATE_FORMAT) : '';
}

/**
 * Start/end pair for lists, e.g. "Jun 1, 2025 – Present".
 * A missing end date means the entry is still ongoing.
 */
export function formatDateRange(start: string | null, end: string | null): string {
  const from = formatDate(start);
  const to = end ? formatDate(end) : 'Present';
  return from ? `${from} – ${to}` : to === 'Present' ? '' : `Until ${to}`;
}

/**
 * True when both dates exist and the end is earlier than the start.
 * ISO dates ("yyyy-MM-dd") sort correctly as plain text, so a string comparison is enough.
 */
export function isEndBeforeStart(start: string | null, end: string | null): boolean {
  return Boolean(start && end && end < start);
}
