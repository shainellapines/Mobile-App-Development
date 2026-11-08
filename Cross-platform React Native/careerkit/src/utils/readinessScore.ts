import type { RequirementStatus } from '@/types/requirement';

/**
 * Career Readiness Score (Section 7.1). A PURE function:
 *   counts and statuses in → score (0–100), label, and suggestions out.
 * No database or screen code here, so it is easy to test and to explain.
 */

/** Ids of the 7 criteria; the Dashboard uses them to open the right screen for each suggestion. */
export type ReadinessCriterionId =
  | 'profile'
  | 'education'
  | 'experience'
  | 'skills'
  | 'certification'
  | 'requirements'
  | 'resume';

export type ReadinessInput = {
  /** Labels of the missing profile fields among name, email, phone, summary ([] = complete). */
  profileMissing: string[];
  educationCount: number;
  experienceCount: number;
  projectCount: number;
  skillCount: number;
  certificationCount: number;
  requirements: { name: string; status: RequirementStatus }[];
  resumeCount: number;
};

export type ReadinessCriterion = {
  id: ReadinessCriterionId;
  points: number;
  met: boolean;
  /** What to do to earn the points, e.g. "Add 2 more skills". */
  suggestion: string;
};

export type ReadinessResult = {
  score: number;
  label: string;
  criteria: ReadinessCriterion[];
  /** Unmet criteria, biggest points first: the best next steps. */
  suggestions: ReadinessCriterion[];
};

export const MIN_SKILLS = 3;

/** Score bands (Section 7.1), checked from the top. */
const LABELS: { min: number; label: string }[] = [
  { min: 90, label: 'Job-ready!' },
  { min: 70, label: 'Almost job-ready' },
  { min: 40, label: 'Getting there' },
  { min: 0, label: "Let's get started" },
];

export function readinessLabel(score: number): string {
  return LABELS.find((band) => score >= band.min)?.label ?? LABELS[LABELS.length - 1].label;
}

/** "A", "A and B", "A, B and C". */
function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/** Suggestion for the documents criterion depends on WHY it is not met. */
function requirementSuggestion(requirements: ReadinessInput['requirements']): string {
  const expired = requirements.filter((r) => r.status === 'expired').map((r) => r.name);
  if (expired.length > 0) {
    const shown = expired.slice(0, 2);
    const more = expired.length - shown.length;
    return `Renew your expired ${joinNames(shown)}${more > 0 ? ` (+${more} more)` : ''}`;
  }
  if (requirements.length === 0) return 'Add your pre-employment documents (try Smart Templates)';
  return 'Get at least one pre-employment document, e.g. NBI Clearance';
}

export function computeReadinessScore(input: ReadinessInput): ReadinessResult {
  const skillsNeeded = Math.max(MIN_SKILLS - input.skillCount, 0);
  const hasValid = input.requirements.some((r) => r.status === 'valid');
  const hasExpired = input.requirements.some((r) => r.status === 'expired');

  const criteria: ReadinessCriterion[] = [
    {
      id: 'profile',
      points: 15,
      met: input.profileMissing.length === 0,
      suggestion: `Add your ${joinNames(input.profileMissing)} to your profile`,
    },
    { id: 'education', points: 15, met: input.educationCount >= 1, suggestion: 'Add your education' },
    {
      id: 'experience',
      points: 20,
      met: input.experienceCount + input.projectCount >= 1,
      suggestion: 'Add an experience (like your OJT) or a project',
    },
    {
      id: 'skills',
      points: 15,
      met: skillsNeeded === 0,
      suggestion:
        input.skillCount === 0
          ? `Add at least ${MIN_SKILLS} skills`
          : `Add ${skillsNeeded} more skill${skillsNeeded === 1 ? '' : 's'} (at least ${MIN_SKILLS})`,
    },
    {
      id: 'certification',
      points: 10,
      met: input.certificationCount >= 1,
      suggestion: 'Add a certification or training',
    },
    {
      id: 'requirements',
      points: 15,
      met: hasValid && !hasExpired,
      suggestion: requirementSuggestion(input.requirements),
    },
    { id: 'resume', points: 10, met: input.resumeCount >= 1, suggestion: 'Create your first resume version' },
  ];

  const score = criteria.reduce((sum, c) => sum + (c.met ? c.points : 0), 0);
  // Array sort is stable, so criteria with equal points keep the table order above.
  const suggestions = criteria.filter((c) => !c.met).sort((a, b) => b.points - a.points);

  return { score, label: readinessLabel(score), criteria, suggestions };
}
