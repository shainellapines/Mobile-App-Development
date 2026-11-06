import { addMonths } from 'date-fns';

import { REQUIREMENT_TEMPLATES, type RequirementTemplate } from '@/constants/requirementTemplates';
import { parseIsoDate, toIsoDate } from '@/utils/dates';
import type { RequirementFormValues } from '@/utils/validators';

/** Same name, ignoring upper/lower case and extra spaces. */
export function sameDocumentName(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** Finds the template for a document name in any set, so a typed "nbi clearance" also matches. */
export function findTemplate(name: string): RequirementTemplate | undefined {
  for (const set of Object.values(REQUIREMENT_TEMPLATES)) {
    const match = set.find((t) => sameDocumentName(t.name, name));
    if (match) return match;
  }
  return undefined;
}

/**
 * Suggested expiry date (FR-Q4): issue date + the template's default validity.
 * Returns null when the document has no template, never expires, or there is no issue date.
 */
export function suggestExpiryDate(name: string, issueDate: string | null): string | null {
  const months = findTemplate(name)?.defaultValidityMonths;
  const issued = parseIsoDate(issueDate);
  if (!months || !issued) return null;
  return toIsoDate(addMonths(issued, months)); // date-fns handles month ends, e.g. Jan 31 + 1 month → Feb 28
}

/** 6 → "6 months", 12 → "1 year", 120 → "10 years", null → "No expiry". */
export function validityLabel(months: number | null): string {
  if (!months) return 'No expiry';
  if (months % 12 === 0) {
    const years = months / 12;
    return `${years} year${years === 1 ? '' : 's'}`;
  }
  return `${months} month${months === 1 ? '' : 's'}`;
}

/**
 * What changes in the Requirement form when the user picks a new issue date (FR-Q4):
 * - the expiry is pre-filled from the template's usual validity, but ONLY if it is empty or still
 *   our previous suggestion, so a date the user typed themselves is never overwritten;
 * - "not yet obtained" is unticked, because having an issue date means the user has the document.
 * A pure function, so the rule is easy to test and explain.
 */
export function valuesForNewIssueDate(
  prev: Pick<RequirementFormValues, 'name' | 'issueDate' | 'expiryDate' | 'notYetObtained'>,
  issueDate: string | null
): Pick<RequirementFormValues, 'issueDate' | 'expiryDate' | 'notYetObtained'> {
  const oldSuggestion = suggestExpiryDate(prev.name, prev.issueDate);
  const newSuggestion = suggestExpiryDate(prev.name, issueDate);
  const expiryUntouched = prev.expiryDate === null || prev.expiryDate === oldSuggestion;
  return {
    issueDate,
    expiryDate: expiryUntouched && newSuggestion ? newSuggestion : prev.expiryDate,
    notYetObtained: issueDate ? false : prev.notYetObtained,
  };
}
