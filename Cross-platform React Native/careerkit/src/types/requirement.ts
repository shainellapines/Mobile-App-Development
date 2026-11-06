export type RequirementCategory = 'private' | 'government' | 'abroad' | 'custom';

/** Computed from the dates every time it is shown (FR-Q3), never saved in the database. */
export type RequirementStatus = 'valid' | 'expiring_soon' | 'expired' | 'not_yet_obtained';

/** One row of the `requirements` table, in camelCase. */
export type Requirement = {
  id: number;
  name: string;
  category: RequirementCategory;
  referenceNo: string | null;
  issueDate: string | null;
  /** null = this document does not expire. */
  expiryDate: string | null;
  /** 'not_yet_obtained' when the user marked it as still to get; otherwise null. */
  statusOverride: 'not_yet_obtained' | null;
  notes: string | null;
  /** How many days before expiry to remind the user (used in step 2.3). */
  reminderDaysBefore: number;
  /** Id of the scheduled local notification (used in step 2.3). */
  notificationId: string | null;
  createdAt: string;
  updatedAt: string;
};

/** What the form sends to the repository. notificationId is managed by the reminder service. */
export type RequirementInput = Omit<Requirement, 'id' | 'createdAt' | 'updatedAt' | 'notificationId'>;
