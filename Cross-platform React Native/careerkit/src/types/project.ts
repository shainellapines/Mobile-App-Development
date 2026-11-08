/** One row of the `projects` table, in camelCase. */
export type Project = {
  id: number;
  name: string;
  role: string | null;
  /** Comma-separated, e.g. "React Native, SQLite, TypeScript". */
  techUsed: string | null;
  link: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProjectInput = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;
