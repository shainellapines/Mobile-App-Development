import { useSQLiteContext } from 'expo-sqlite';
import { useCallback } from 'react';

import { getProfile } from '@/db/repositories/profileRepo';
import { duplicateResume, getResumeContent, resumeRepo, setResumePdf } from '@/db/repositories/resumeRepo';
import { useEntry, useEntryList } from '@/hooks/useVaultEntries';
import { openStoredFile } from '@/services/fileService';
import { deleteResumePdfs, exportResumePdf, shareResumePdf } from '@/services/pdfService';
import { buildAtsSimpleHtml } from '@/templates/resume/atsSimple';
import type { Resume, ResumeContent } from '@/types/resume';

/** Saved resume versions, most recently edited first (FR-R5). */
export const useResumes = () => useEntryList(resumeRepo);

/** One resume version for the builder / preview. */
export const useResume = (id: number | undefined) => useEntry(id, resumeRepo);

/**
 * Picks the HTML template for a resume. Only "ats_simple" exists in Phase 1;
 * "modern" (step 3.2) will get its own builder function here.
 */
function buildHtml(resume: Resume, content: ResumeContent): string {
  switch (resume.template) {
    case 'modern': // not built yet (step 3.2): fall back to ATS Simple
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
    const path = await exportResumePdf(resume.id, content.profile?.fullName ?? '', buildHtml(resume, content));
    await setResumePdf(db, resume.id, path);
    return path;
  }, [db, resume]);

  const previewPdf = useCallback(async () => {
    const path = await exportPdf();
    await openStoredFile(path, 'application/pdf', resume?.title);
  }, [exportPdf, resume]);

  const sharePdf = useCallback(async () => {
    const path = await exportPdf();
    await shareResumePdf(path, resume?.title ?? 'Resume');
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
