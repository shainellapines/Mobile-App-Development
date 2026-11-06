import type { SelectOption } from '@/components/Select';
import type { ExperienceType } from '@/types/experience';

/** Choices for the Experience "Type" field, with user-friendly labels. */
export const EXPERIENCE_TYPE_OPTIONS: readonly SelectOption<ExperienceType>[] = [
  { value: 'job', label: 'Job' },
  { value: 'ojt', label: 'OJT / Internship' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'organization', label: 'Organization' },
];

/** 'ojt' → 'OJT / Internship' (falls back to the raw value if unknown). */
export function experienceTypeLabel(type: ExperienceType): string {
  return EXPERIENCE_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;
}
