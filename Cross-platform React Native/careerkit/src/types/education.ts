/** One row of the `education` table, in camelCase. */
export type Education = {
  id: number;
  school: string;
  degree: string;
  startDate: string | null;
  /** null = still studying ("Present"). */
  endDate: string | null;
  honors: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EducationInput = Omit<Education, 'id' | 'createdAt' | 'updatedAt'>;
