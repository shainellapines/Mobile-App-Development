import { addDays, differenceInCalendarDays, endOfDay, set, subDays } from 'date-fns';

import { NEXT_STEP_MORNING_HOUR, REMINDER_HOUR } from '@/constants/notifications';
import { parseIsoDate } from '@/utils/dates';

/** A day at hour:00:00 (default REMINDER_HOUR). */
function atReminderHour(day: Date, hour: number = REMINDER_HOUR): Date {
  return set(day, { hours: hour, minutes: 0, seconds: 0, milliseconds: 0 });
}

/**
 * When should the expiry reminder go off? (FR-Q5) A PURE function, easy to test.
 * - Normally: `daysBefore` days before the expiry date, at 9:00 AM.
 * - If that moment has already passed but the document has NOT expired yet
 *   (e.g. it expires in 5 days but the reminder is set to 14 days before),
 *   remind at the next 9:00 AM instead, so the user still gets warned.
 * - Returns null when there is nothing to remind about: no expiry date, already expired,
 *   or the next 9:00 AM would be after the expiry day.
 */
export function reminderFireDate(
  expiryDate: string | null,
  daysBefore: number,
  now: Date = new Date()
): Date | null {
  const expiry = parseIsoDate(expiryDate);
  if (!expiry) return null;
  if (differenceInCalendarDays(expiry, now) < 0) return null; // already expired

  const planned = atReminderHour(subDays(expiry, daysBefore));
  if (planned > now) return planned;

  const todayAtHour = atReminderHour(now);
  const next = todayAtHour > now ? todayAtHour : addDays(todayAtHour, 1);
  return next <= endOfDay(expiry) ? next : null;
}

/** "in 14 days", "tomorrow", "today" — how far the expiry is from the reminder moment. */
export function daysLeftText(expiryDate: string, fireDate: Date): string {
  const expiry = parseIsoDate(expiryDate);
  if (!expiry) return '';
  const days = differenceInCalendarDays(expiry, fireDate);
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

/**
 * When should the interview / next-step reminder go off? (FR-A5) PURE function.
 * - Normally: the DAY BEFORE, at 9:00 AM, so there is time to prepare.
 * - If that has passed (e.g. the interview was booked for tomorrow afternoon, and it is already
 *   evening), remind on the day itself at 7:00 AM instead.
 * - null when the date is missing or both moments have passed.
 */
export function nextStepReminderDate(nextStepDate: string | null, now: Date = new Date()): Date | null {
  const day = parseIsoDate(nextStepDate);
  if (!day) return null;
  const dayBefore = atReminderHour(subDays(day, 1));
  if (dayBefore > now) return dayBefore;
  const morningOf = atReminderHour(day, NEXT_STEP_MORNING_HOUR);
  return morningOf > now ? morningOf : null;
}
