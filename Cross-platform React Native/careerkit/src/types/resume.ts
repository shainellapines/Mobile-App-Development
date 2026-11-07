import type { Certification } from '@/types/certification';
import type { Education } from '@/types/education';
import type { Experience } from '@/types/experience';
import type { Profile } from '@/types/profile';
import type { Project } from '@/types/project';
import type { Skill } from '@/types/skill';

/** Resume designs (FR-R3): ATS Simple (Phase 1) and Modern (Phase 3). */
export type ResumeTemplate = 'ats_simple' | 'modern';

/** Which vault table a resume item points to (resume_items.item_type). */
export type ResumeItemType = 'education' | 'experience' | 'project' | 'skill' | 'certification';

/** One selected vault entry. Items are kept in the order the user arranged them. */
export type ResumeItem = {
  itemType: ResumeItemType;
  itemId: number;
};

/** One saved resume version (a row of `resumes` plus its selected items). */
export type Resume = {
  id: number;
  title: string;
  template: ResumeTemplate;
  targetRole: string | null;
  /** Relative path of the last exported PDF, e.g. "resumes/3/Juan_Dela_Cruz_Resume.pdf". */
  pdfUri: string | null;
  items: ResumeItem[];
  createdAt: string;
  updatedAt: string;
};

export type ResumeInput = Pick<Resume, 'title' | 'template' | 'targetRole' | 'items'>;

/** Everything a resume template needs, already filtered and in the user's chosen order. */
export type ResumeContent = {
  profile: Profile | null;
  targetRole: string | null;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
};
