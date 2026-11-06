export type SkillCategory = 'technical' | 'soft' | 'language' | 'tool';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

/** One row of the `skills` table, in camelCase. */
export type Skill = {
  id: number;
  name: string;
  category: SkillCategory;
  /** null = level not specified. */
  level: SkillLevel | null;
  createdAt: string;
  updatedAt: string;
};

export type SkillInput = Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>;
