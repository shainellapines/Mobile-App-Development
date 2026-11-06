import { differenceInCalendarDays, startOfToday } from 'date-fns';

import { EXPIRING_SOON_DAYS, REQUIREMENT_STATUS_ORDER } from '@/constants/requirements';
import type { Requirement, RequirementStatus } from '@/types/requirement';
import { parseIsoDate } from '@/utils/dates';

/**
 * Works out a requirement's status from its dates (FR-Q3). A PURE function: same input →
 * same output, no database or screen involved, so it is easy to test and explain.
 * Rules, checked in this order:
 * 1. not_yet_obtained — the user marked it so, or there is no issue date yet
 * 2. expired          — the expiry date is before today
 * 3. expiring_soon    — it expires within EXPIRING_SOON_DAYS (30) days
 * 4. valid            — otherwise (including documents that never expire)
 * `today` can be passed in for testing; normally it is the current date.
 */
export function getRequirementStatus(
  req: Pick<Requirement, 'statusOverride' | 'issueDate' | 'expiryDate'>,
  today: Date = startOfToday()
): RequirementStatus {
  if (req.statusOverride === 'not_yet_obtained' || !req.issueDate) return 'not_yet_obtained';

  const expiry = parseIsoDate(req.expiryDate);
  if (!expiry) return 'valid'; // no expiry date = never expires

  const daysLeft = differenceInCalendarDays(expiry, today);
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= EXPIRING_SOON_DAYS) return 'expiring_soon';
  return 'valid';
}

/** Days until expiry (negative = days since it expired), or null if it has no expiry date. */
export function daysUntilExpiry(expiryDate: string | null, today: Date = startOfToday()): number | null {
  const expiry = parseIsoDate(expiryDate);
  return expiry ? differenceInCalendarDays(expiry, today) : null;
}

/** "Expires in 12 days", "Expires today", "Expired 3 days ago" — or '' when not relevant. */
export function expiryCountdown(
  req: Pick<Requirement, 'statusOverride' | 'issueDate' | 'expiryDate'>,
  today: Date = startOfToday()
): string {
  if (getRequirementStatus(req, today) === 'not_yet_obtained') return '';
  const days = daysUntilExpiry(req.expiryDate, today);
  if (days === null) return 'No expiry';
  if (days === 0) return 'Expires today';
  if (days > 0) return `Expires in ${days} day${days === 1 ? '' : 's'}`;
  const ago = -days;
  return `Expired ${ago} day${ago === 1 ? '' : 's'} ago`;
}

/**
 * Most urgent first: expired → expiring soon → not yet obtained → valid.
 * Within the same status, the one expiring soonest comes first; then A–Z by name.
 */
export function sortByUrgency(items: Requirement[], today: Date = startOfToday()): Requirement[] {
  const rank = (r: Requirement) => REQUIREMENT_STATUS_ORDER.indexOf(getRequirementStatus(r, today));
  return [...items].sort((a, b) => {
    if (rank(a) !== rank(b)) return rank(a) - rank(b);
    const da = a.expiryDate ?? '9999-12-31'; // no expiry sorts last
    const db = b.expiryDate ?? '9999-12-31';
    if (da !== db) return da < db ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}
