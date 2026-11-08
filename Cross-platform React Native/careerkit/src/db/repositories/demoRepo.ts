import type { SQLiteDatabase } from 'expo-sqlite';

import { applicationRepo } from '@/db/repositories/applicationRepo';
import { certificationRepo } from '@/db/repositories/certificationRepo';
import { educationRepo } from '@/db/repositories/educationRepo';
import { experienceRepo } from '@/db/repositories/experienceRepo';
import { ojtLogRepo, saveOjtInfo } from '@/db/repositories/ojtRepo';
import { ojtRequirementRepo, setOjtRequirementDone } from '@/db/repositories/ojtRequirementRepo';
import { saveProfile } from '@/db/repositories/profileRepo';
import { projectRepo } from '@/db/repositories/projectRepo';
import { requirementRepo } from '@/db/repositories/requirementRepo';
import { resumeRepo } from '@/db/repositories/resumeRepo';
import { setSetting, SETTING_KEYS } from '@/db/repositories/settingsRepo';
import { skillRepo } from '@/db/repositories/skillRepo';
import type { ResumeItem, ResumeItemType } from '@/types/resume';
import type { DemoData } from '@/utils/demoData';

/** Creates every item with the repository's own `create`, in order, and returns the new ids. */
async function createAll<I>(
  db: SQLiteDatabase,
  create: (db: SQLiteDatabase, input: I) => Promise<number>,
  inputs: I[]
): Promise<number[]> {
  const ids: number[] = [];
  for (const input of inputs) ids.push(await create(db, input));
  return ids;
}

/**
 * Writes the demo data (step 3.5) into an EMPTY database, using the same repository
 * functions the screens use, so the demo data is exactly like data typed in by hand.
 *
 * Not wrapped in one big transaction: some repository functions (resume, OJT setup) already
 * use their own transaction, and SQLite cannot nest them. The caller always clears the
 * database first, so if something fails halfway, simply loading the demo again fixes it.
 */
export async function seedDemoData(db: SQLiteDatabase, data: DemoData): Promise<void> {
  await saveProfile(db, data.profile);

  const ids: Record<ResumeItemType, number[]> = {
    education: await createAll(db, educationRepo.create, data.education),
    experience: await createAll(db, experienceRepo.create, data.experience),
    project: await createAll(db, projectRepo.create, data.projects),
    skill: await createAll(db, skillRepo.create, data.skills),
    certification: await createAll(db, certificationRepo.create, data.certifications),
  };

  await createAll(db, requirementRepo.create, data.requirements);

  // OJT: the first setup also fills the default checklist; then tick the first few as done.
  await saveOjtInfo(db, data.ojtInfo);
  await createAll(db, ojtLogRepo.create, data.ojtLogs);
  const checklist = await ojtRequirementRepo.list(db); // to-do items first, in seeding order
  for (const item of checklist.slice(0, data.ojtRequirementsDone)) {
    await setOjtRequirementDone(db, item.id, true);
  }

  // One saved resume version, built from the entries picked in the demo data.
  const pick = (type: ResumeItemType, indexes: number[]): ResumeItem[] =>
    indexes.map((i) => ({ itemType: type, itemId: ids[type][i] }));
  const r = data.resume;
  const resumeId = await resumeRepo.create(db, {
    title: r.title,
    template: 'ats_simple',
    targetRole: r.targetRole,
    items: [
      ...pick('education', r.educationIndexes),
      ...pick('experience', r.experienceIndexes),
      ...pick('project', r.projectIndexes),
      ...pick('skill', r.skillIndexes),
      ...pick('certification', r.certificationIndexes),
    ],
  });

  for (const { usesResume, ...app } of data.applications) {
    await applicationRepo.create(db, { ...app, resumeId: usesResume ? resumeId : null });
  }

  // Skip the intro slides: the demo starts straight on the Dashboard.
  await setSetting(db, SETTING_KEYS.onboardingDone, 'true');
}
