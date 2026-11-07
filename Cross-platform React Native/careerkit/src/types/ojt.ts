/** The single row of `ojt_info` (id is always 1), in camelCase. */
export type OjtInfo = {
  company: string | null;
  supervisor: string | null;
  requiredHours: number;
  startDate: string | null;
  targetEndDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OjtInfoInput = Omit<OjtInfo, 'createdAt' | 'updatedAt'>;

/** One row of `ojt_logs` (a daily time record). */
export type OjtLog = {
  id: number;
  logDate: string;
  /** "HH:mm", 24-hour. */
  timeIn: string;
  timeOut: string;
  breakMinutes: number;
  /** Computed from the times when saving, and stored (Section 5). */
  hours: number;
  tasks: string | null;
  createdAt: string;
  updatedAt: string;
};

/** No `hours` here: the repository always calculates it from the times, so it can never be wrong. */
export type OjtLogInput = Omit<OjtLog, 'id' | 'hours' | 'createdAt' | 'updatedAt'>;

/** One row of `ojt_requirements` (the OJT checklist). */
export type OjtRequirement = {
  id: number;
  name: string;
  isDone: boolean;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OjtRequirementInput = Omit<OjtRequirement, 'id' | 'createdAt' | 'updatedAt'>;
