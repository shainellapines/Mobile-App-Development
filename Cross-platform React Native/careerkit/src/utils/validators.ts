import { MAX_REMINDER_DAYS } from '@/constants/requirements';
import type { ApplicationChannel, ApplicationStatus } from '@/types/application';
import type { ExperienceType } from '@/types/experience';
import type { RequirementCategory } from '@/types/requirement';
import type { SkillCategory, SkillLevel } from '@/types/skill';
import { isEndBeforeStart } from '@/utils/dates';

/**
 * Form validation helpers (FR-V3). Pure functions: text in → true/false or error message out.
 * They are shared by every form, so the rules are the same everywhere in the app.
 */

/** Simple, practical email check: something@something.something, no spaces. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Accepts web links with or without "https://", e.g. "linkedin.com/in/juan" or
 * "https://juan.dev". Needs a domain with a dot and no spaces.
 */
export function isValidUrl(value: string): boolean {
  return /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(value.trim());
}

/** Phone numbers like "0917 123 4567" or "+63 917 123 4567": 7–15 digits plus spaces, +, -, (). */
export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!/^[+\d\s()-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '').length;
  return digits >= 7 && digits <= 15;
}

/** Turns an empty/whitespace-only input into null so the DB stores "no value" consistently. */
export function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/** Field values of the Profile form (all plain strings while the user is typing). */
export type ProfileFormValues = {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  address: string;
  summary: string;
  linkedinUrl: string;
  portfolioUrl: string;
};

export type FormErrors<T> = Partial<Record<keyof T, string>>;

/** Returns an error message per invalid field. An empty object means the form is valid. */
export function validateProfile(values: ProfileFormValues): FormErrors<ProfileFormValues> {
  const errors: FormErrors<ProfileFormValues> = {};

  if (values.fullName.trim() === '') errors.fullName = 'Full name is required';
  if (values.email.trim() !== '' && !isValidEmail(values.email)) {
    errors.email = 'Enter a valid email, e.g. juan@email.com';
  }
  if (values.phone.trim() !== '' && !isValidPhone(values.phone)) {
    errors.phone = 'Enter a valid phone number, e.g. 0917 123 4567';
  }
  if (values.linkedinUrl.trim() !== '' && !isValidUrl(values.linkedinUrl)) {
    errors.linkedinUrl = 'Enter a valid link, e.g. linkedin.com/in/juan';
  }
  if (values.portfolioUrl.trim() !== '' && !isValidUrl(values.portfolioUrl)) {
    errors.portfolioUrl = 'Enter a valid link, e.g. juan.dev';
  }

  return errors;
}

/** Field values of the Experience form. Dates are "yyyy-MM-dd" or null. */
export type ExperienceFormValues = {
  title: string;
  organization: string;
  type: ExperienceType;
  location: string;
  startDate: string | null;
  endDate: string | null;
  description: string;
};

export function validateExperience(values: ExperienceFormValues): FormErrors<ExperienceFormValues> {
  const errors: FormErrors<ExperienceFormValues> = {};

  if (values.title.trim() === '') errors.title = 'Title / position is required';
  if (values.organization.trim() === '') errors.organization = 'Company or organization is required';
  if (isEndBeforeStart(values.startDate, values.endDate)) {
    errors.endDate = 'End date cannot be before the start date';
  }

  return errors;
}

/** Field values of the Education form. */
export type EducationFormValues = {
  school: string;
  degree: string;
  startDate: string | null;
  endDate: string | null;
  honors: string;
  description: string;
};

export function validateEducation(values: EducationFormValues): FormErrors<EducationFormValues> {
  const errors: FormErrors<EducationFormValues> = {};

  if (values.school.trim() === '') errors.school = 'School is required';
  if (values.degree.trim() === '') errors.degree = 'Degree / program is required';
  if (isEndBeforeStart(values.startDate, values.endDate)) {
    errors.endDate = 'End date cannot be before the start date';
  }

  return errors;
}

/** Field values of the Project form. */
export type ProjectFormValues = {
  name: string;
  role: string;
  techUsed: string;
  link: string;
  startDate: string | null;
  endDate: string | null;
  description: string;
};

export function validateProject(values: ProjectFormValues): FormErrors<ProjectFormValues> {
  const errors: FormErrors<ProjectFormValues> = {};

  if (values.name.trim() === '') errors.name = 'Project name is required';
  if (values.link.trim() !== '' && !isValidUrl(values.link)) {
    errors.link = 'Enter a valid link, e.g. github.com/juan/project';
  }
  if (isEndBeforeStart(values.startDate, values.endDate)) {
    errors.endDate = 'End date cannot be before the start date';
  }

  return errors;
}

/** Field values of the Skill form. 'none' = no level chosen (saved as NULL). */
export type SkillFormValues = {
  name: string;
  category: SkillCategory;
  level: SkillLevel | 'none';
};

export function validateSkill(values: SkillFormValues): FormErrors<SkillFormValues> {
  const errors: FormErrors<SkillFormValues> = {};
  if (values.name.trim() === '') errors.name = 'Skill name is required';
  return errors;
}

/** Field values of the Certification form. */
export type CertificationFormValues = {
  name: string;
  issuer: string;
  issueDate: string | null;
  expiryDate: string | null;
  credentialId: string;
};

export function validateCertification(
  values: CertificationFormValues
): FormErrors<CertificationFormValues> {
  const errors: FormErrors<CertificationFormValues> = {};

  if (values.name.trim() === '') errors.name = 'Certification name is required';
  if (isEndBeforeStart(values.issueDate, values.expiryDate)) {
    errors.expiryDate = 'Expiry date cannot be before the issue date';
  }

  return errors;
}

/** Field values of the Resume builder (only the text fields need validating). */
export type ResumeFormValues = {
  title: string;
  targetRole: string;
};

export function validateResume(values: ResumeFormValues): FormErrors<ResumeFormValues> {
  const errors: FormErrors<ResumeFormValues> = {};
  if (values.title.trim() === '') errors.title = 'Give this resume a name, e.g. "Front-End Dev – Accenture"';
  return errors;
}

/** Field values of the Requirement form. reminderDays is text while typing (e.g. "14"). */
export type RequirementFormValues = {
  name: string;
  category: RequirementCategory;
  referenceNo: string;
  issueDate: string | null;
  expiryDate: string | null;
  notYetObtained: boolean;
  reminderDays: string;
  notes: string;
};

export function validateRequirement(values: RequirementFormValues): FormErrors<RequirementFormValues> {
  const errors: FormErrors<RequirementFormValues> = {};

  if (values.name.trim() === '') errors.name = 'Document name is required';
  if (isEndBeforeStart(values.issueDate, values.expiryDate)) {
    errors.expiryDate = 'Expiry date cannot be before the issue date';
  }
  const days = Number(values.reminderDays);
  if (!/^\d+$/.test(values.reminderDays.trim()) || days > MAX_REMINDER_DAYS) {
    errors.reminderDays = `Enter a whole number from 0 to ${MAX_REMINDER_DAYS}`;
  }

  return errors;
}

/** Field values of the Application form. resumeId is 'none' or a resume id as text (for the chips). */
export type ApplicationFormValues = {
  company: string;
  position: string;
  dateApplied: string | null;
  channel: ApplicationChannel | 'none';
  status: ApplicationStatus;
  resumeId: string;
  salaryOffer: string;
  nextStepDate: string | null;
  notes: string;
};

export function validateApplication(values: ApplicationFormValues): FormErrors<ApplicationFormValues> {
  const errors: FormErrors<ApplicationFormValues> = {};

  if (values.company.trim() === '') errors.company = 'Company is required';
  if (values.position.trim() === '') errors.position = 'Position is required';
  if (!values.dateApplied) errors.dateApplied = 'Date applied is required';
  if (isEndBeforeStart(values.dateApplied, values.nextStepDate)) {
    errors.nextStepDate = 'The next step cannot be before the date you applied';
  }

  return errors;
}
