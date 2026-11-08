export type ExperienceType = 'job' | 'ojt' | 'volunteer' | 'organization';

/** One row of the `experiences` table, in camelCase. */
export type Experience = {
  id: number;
  title: string;
  organization: string;
  type: ExperienceType;
  location: string | null;
  startDate: string | null;
  /** null = still ongoing ("Present"). */
  endDate: string | null;
  /** Bullet points, one per line. */
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

/** What the form sends to the repository (the DB fills in id and timestamps). */
export type ExperienceInput = Omit<Experience, 'id' | 'createdAt' | 'updatedAt'>;
