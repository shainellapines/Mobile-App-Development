import { addBusinessDays, max } from 'date-fns';

import { parseIsoDate, toIsoDate } from '@/utils/dates';
import { roundHours } from '@/utils/ojtHours';

/** Everything the OJT overview (and later the Dashboard) shows about progress (FR-O3). */
export type OjtProgress = {
  requiredHours: number;
  renderedHours: number;
  remainingHours: number;
  /** 0 to 1, for the progress bar. */
  progress: number;
  /** Number of different dates with at least one log. */
  daysLogged: number;
  averageHoursPerDay: number;
  /** "yyyy-MM-dd", or null when it cannot be estimated yet (no logs) or OJT is complete. */
  estimatedEndDate: string | null;
  isComplete: boolean;
};

/**
 * Pure function: required hours + logs + today → progress numbers.
 *
 * Estimated completion date (FR-O3):
 *   average per day = rendered hours ÷ days logged
 *   days still needed = remaining hours ÷ average (rounded up)
 *   then count that many WEEKDAYS (Mon–Fri, since OJT usually skips weekends)
 *   starting after today, or after the latest log if it is in the future.
 */
export function computeOjtProgress(
  requiredHours: number,
  logs: { logDate: string; hours: number }[],
  today: Date = new Date()
): OjtProgress {
  const renderedHours = roundHours(logs.reduce((sum, log) => sum + log.hours, 0));
  const remainingHours = roundHours(Math.max(requiredHours - renderedHours, 0));
  const isComplete = requiredHours > 0 && remainingHours === 0;
  const progress = requiredHours > 0 ? Math.min(renderedHours / requiredHours, 1) : 0;

  const uniqueDates = [...new Set(logs.map((log) => log.logDate))];
  const daysLogged = uniqueDates.length;
  const averageHoursPerDay = daysLogged > 0 ? roundHours(renderedHours / daysLogged) : 0;

  let estimatedEndDate: string | null = null;
  if (!isComplete && averageHoursPerDay > 0) {
    const daysNeeded = Math.ceil(remainingHours / averageHoursPerDay);
    const logDates = uniqueDates.map((d) => parseIsoDate(d)).filter((d): d is Date => d !== null);
    const from = max([today, ...logDates]); // the later of today and the newest log
    estimatedEndDate = toIsoDate(addBusinessDays(from, daysNeeded));
  }

  return {
    requiredHours,
    renderedHours,
    remainingHours,
    progress,
    daysLogged,
    averageHoursPerDay,
    estimatedEndDate,
    isComplete,
  };
}
