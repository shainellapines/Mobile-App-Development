export type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn';

export type ApplicationChannel = 'JobStreet' | 'LinkedIn' | 'Walk-in' | 'Referral' | 'Company site' | 'Other';

/** One row of the `applications` table, in camelCase. */
export type Application = {
  id: number;
  company: string;
  position: string;
  dateApplied: string;
  channel: ApplicationChannel | null;
  status: ApplicationStatus;
  /** The resume version that was sent (null = none, or that resume was deleted). */
  resumeId: number | null;
  /** Title of that resume, joined from the resumes table for display. */
  resumeTitle: string | null;
  salaryOffer: string | null;
  /** Date of the next step, e.g. the interview. */
  nextStepDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationInput = Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'resumeTitle'>;
