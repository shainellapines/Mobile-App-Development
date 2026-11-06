/** One row of the `certifications` table, in camelCase. */
export type Certification = {
  id: number;
  name: string;
  issuer: string | null;
  issueDate: string | null;
  /** null = does not expire. */
  expiryDate: string | null;
  credentialId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CertificationInput = Omit<Certification, 'id' | 'createdAt' | 'updatedAt'>;
