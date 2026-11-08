import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { getProfile } from '@/db/repositories/profileRepo';
import { duplicateResume, getResumeContent, resumeRepo, setResumePdf } from '@/db/repositories/resumeRepo';
import { useEntry, useEntryList } from '@/hooks/useVaultEntries';
import { openStoredFile, readImageAsDataUri } from '@/services/fileService';
import { deleteResumePdfs, exportResumePdf, shareStoredPdf } from '@/services/pdfService';
import { buildAtsSimpleHtml } from '@/templates/resume/atsSimple';
import { buildModernHtml } from '@/templates/resume/modern';
import type { Resume, ResumeContent } from '@/types/resume';

/** Saved resume versions, most recently edited first (FR-R5). */
export const useResumes = () => useEntryList(resumeRepo);

/** One resume version for the builder / preview. */
export const useResume = (id: number | undefined) => useEntry(id, resumeRepo);

/**
 * Picks the HTML template for a resume (FR-R3).
 * Modern also shows the profile photo, read from the phone and put inside the HTML.
 */
async function buildHtml(resume: Resume, content: ResumeContent): Promise<string> {
  switch (resume.template) {
    case 'modern': {
      const photoPath = content.profile?.photoUri;
      const photo = photoPath ? await readImageAsDataUri(photoPath) : null;
      return buildModernHtml(content, photo);
    }
    case 'ats_simple':
    default:
      return buildAtsSimpleHtml(content);
  }
}

/**
 * Actions on one saved resume: export / preview / share the PDF, duplicate, delete.
 * Every export is regenerated from the CURRENT vault data, so edits are always included.
 * All actions throw on failure so the screen can show a message.
 */
export function useResumeActions(resume: Resume | null) {
  const db = useSQLiteContext();

  /** Builds the PDF and remembers its path. Returns the relative path. */
  const exportPdf = useCallback(async (): Promise<string> => {
    if (!resume) throw new Error('No resume loaded');
    const content = await getResumeContent(db, resume);
    const path = await exportResumePdf(resume.id, content.profile?.fullName ?? '', await buildHtml(resume, content));
    await setResumePdf(db, resume.id, path);
    return path;
  }, [db, resume]);

  const previewPdf = useCallback(async () => {
    const path = await exportPdf();
    await openStoredFile(path, 'application/pdf', resume?.title);
  }, [exportPdf, resume]);

  const sharePdf = useCallback(async () => {
    const path = await exportPdf();
    await shareStoredPdf(path, resume?.title ?? 'Resume');
  }, [exportPdf, resume]);

  /** Returns the new copy's id. */
  const duplicate = useCallback(async (): Promise<number> => {
    if (!resume) throw new Error('No resume loaded');
    return duplicateResume(db, resume.id);
  }, [db, resume]);

  /** Deletes the DB row, then the exported PDF files. */
  const remove = useCallback(async () => {
    if (!resume) return;
    await resumeRepo.remove(db, resume.id);
    deleteResumePdfs(resume.id);
  }, [db, resume]);

  /** True if the profile has a name; the resume needs one at the top. */
  const hasProfileName = useCallback(async () => Boolean((await getProfile(db))?.fullName.trim()), [db]);

  return { previewPdf, sharePdf, duplicate, remove, hasProfileName };
}
