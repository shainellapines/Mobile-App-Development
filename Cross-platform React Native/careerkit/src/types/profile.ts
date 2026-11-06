/** One row of the `profile` table (always id = 1), in camelCase for use in the app. */
export type Profile = {
  id: 1;
  fullName: string;
  headline: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  summary: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  photoUri: string | null;
  createdAt: string;
  updatedAt: string;
};

/** What the Profile form sends to the repository (the DB fills in id and timestamps). */
export type ProfileInput = Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>;
