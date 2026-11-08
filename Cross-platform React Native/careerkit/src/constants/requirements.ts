import type { SelectOption } from '@/components/Select';
import { StatusColors } from '@/constants/theme';
import type { RequirementCategory, RequirementStatus } from '@/types/requirement';

/** A document counts as "expiring soon" when it expires within this many days (FR-Q3). */
export const EXPIRING_SOON_DAYS = 30;

/** Default reminder: notify this many days before a document expires (FR-Q5). */
export const DEFAULT_REMINDER_DAYS = 14;
/** Upper limit for the reminder field, so a typo like 1400 is caught. */
export const MAX_REMINDER_DAYS = 365;

export const REQUIREMENT_CATEGORY_OPTIONS: readonly SelectOption<RequirementCategory>[] = [
  { value: 'private', label: 'Private' },
  { value: 'government', label: 'Government' },
  { value: 'abroad', label: 'Abroad / OFW' },
  { value: 'custom', label: 'Custom' },
];

export function requirementCategoryLabel(category: RequirementCategory): string {
  return REQUIREMENT_CATEGORY_OPTIONS.find((o) => o.value === category)?.label ?? category;
}

/** Badge text and color for each status (Section 8.1 status colors). */
export const REQUIREMENT_STATUS_INFO: Record<RequirementStatus, { label: string; color: string }> = {
  expired: { label: 'Expired', color: StatusColors.expired },
  expiring_soon: { label: 'Expiring soon', color: StatusColors.expiring_soon },
  not_yet_obtained: { label: 'Not yet obtained', color: StatusColors.not_yet_obtained },
  valid: { label: 'Valid', color: StatusColors.valid },
};

/** Order used for sorting and for the filter chips: most urgent first. */
export const REQUIREMENT_STATUS_ORDER: RequirementStatus[] = [
  'expired',
  'expiring_soon',
  'not_yet_obtained',
  'valid',
];
