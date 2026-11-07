import type { SelectOption } from '@/components/Select';
import { ApplicationStatusColors } from '@/constants/theme';
import type { ApplicationChannel, ApplicationStatus } from '@/types/application';

/** Badge text and color for each application status (Section 8.1). */
export const APPLICATION_STATUS_INFO: Record<ApplicationStatus, { label: string; color: string }> = {
  applied: { label: 'Applied', color: ApplicationStatusColors.applied },
  interview: { label: 'Interview', color: ApplicationStatusColors.interview },
  offer: { label: 'Offer', color: ApplicationStatusColors.offer },
  rejected: { label: 'Rejected', color: ApplicationStatusColors.rejected },
  withdrawn: { label: 'Withdrawn', color: ApplicationStatusColors.withdrawn },
};

/** Pipeline order (FR-A2): applied → interview → offer, then the two "closed" outcomes. */
export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = ['applied', 'interview', 'offer', 'rejected', 'withdrawn'];

export const APPLICATION_STATUS_OPTIONS: readonly SelectOption<ApplicationStatus>[] = APPLICATION_STATUS_ORDER.map(
  (status) => ({ value: status, label: APPLICATION_STATUS_INFO[status].label })
);

/** Where the user found or sent the application. 'none' = not specified (saved as NULL). */
export const APPLICATION_CHANNEL_OPTIONS: readonly SelectOption<ApplicationChannel | 'none'>[] = [
  { value: 'none', label: 'Not set' },
  { value: 'JobStreet', label: 'JobStreet' },
  { value: 'LinkedIn', label: 'LinkedIn' },
  { value: 'Walk-in', label: 'Walk-in' },
  { value: 'Referral', label: 'Referral' },
  { value: 'Company site', label: 'Company site' },
  { value: 'Other', label: 'Other' },
];
