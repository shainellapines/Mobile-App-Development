import type { SelectOption } from '@/components/Select';
import type { ExperienceType } from '@/types/experience';
import type { SkillCategory, SkillLevel } from '@/types/skill';

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

/** Choices for the Skill "Category" field. */
export const SKILL_CATEGORY_OPTIONS: readonly SelectOption<SkillCategory>[] = [
  { value: 'technical', label: 'Technical' },
  { value: 'soft', label: 'Soft skill' },
  { value: 'language', label: 'Language' },
  { value: 'tool', label: 'Tool / Software' },
];

/** Choices for the Skill "Level" field. 'none' means the user did not pick a level. */
export const SKILL_LEVEL_OPTIONS: readonly SelectOption<SkillLevel | 'none'>[] = [
  { value: 'none', label: 'Not set' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export function skillCategoryLabel(category: SkillCategory): string {
  return SKILL_CATEGORY_OPTIONS.find((o) => o.value === category)?.label ?? category;
}

export function skillLevelLabel(level: SkillLevel | null): string {
  return SKILL_LEVEL_OPTIONS.find((o) => o.value === level)?.label ?? '';
}
