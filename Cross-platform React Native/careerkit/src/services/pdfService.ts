import { Directory, File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

/** A4 paper in PDF points (72 per inch): 210 × 297 mm. */
const A4_WIDTH = 595;
const A4_HEIGHT = 842;
/** iOS ignores CSS page margins, so it gets them here (≈16 mm). Android uses the CSS @page rule. */
const IOS_MARGIN = 45;

/** Folder (inside the app's documents) that holds exported resume PDFs, one subfolder per resume. */
const RESUMES_DIR = 'resumes';

/** "Juan Dela Cruz" → "Juan_Dela_Cruz": safe for file names on every phone and computer. */
function safeFileName(text: string): string {
  const cleaned = text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // "ñ" → "n", "é" → "e"
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return cleaned || 'Resume';
}

/**
 * Turns resume HTML into a PDF saved at "resumes/<id>/<Name>_Resume.pdf" (FR-R4).
 * Returns that relative path.
 *
 * We ask expo-print for the PDF as base64 text and write the file ourselves. On Android,
 * expo-print's own output file sits in a cache folder that Expo Go does not let us read,
 * so reading it would fail (the same problem the document picker had).
 */
export async function exportResumePdf(resumeId: number, ownerName: string, html: string): Promise<string> {
  const result = await Print.printToFileAsync({
    html,
    width: A4_WIDTH,
    height: A4_HEIGHT,
    margins: { top: IOS_MARGIN, bottom: IOS_MARGIN, left: IOS_MARGIN, right: IOS_MARGIN },
    base64: true,
  });
  if (!result.base64) throw new Error('PDF generation returned no data');

  // One folder per resume: clear it so only the latest export is kept.
  const folder = new Directory(Paths.document, RESUMES_DIR, String(resumeId));
  if (folder.exists) folder.delete();
  folder.create({ intermediates: true });

  const fileName = `${safeFileName(ownerName)}_Resume.pdf`;
  const pdf = new File(folder, fileName);
  pdf.create();
  await pdf.write(result.base64, { encoding: 'base64' });

  // Best effort: remove expo-print's temporary copy (may not be allowed in Expo Go; that's fine).
  try {
    const temp = new File(result.uri);
    if (temp.exists) temp.delete();
  } catch {
    // ignore: the OS clears cache folders on its own
  }

  return `${RESUMES_DIR}/${resumeId}/${fileName}`;
}

/** Opens the Share sheet for a saved PDF (email, Messenger, Drive, ...). */
export async function shareResumePdf(path: string, title: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing is not available on this device');
  const file = new File(Paths.document, path);
  await Sharing.shareAsync(file.uri, {
    mimeType: 'application/pdf',
    UTI: 'com.adobe.pdf',
    dialogTitle: title,
  });
}

/** Deletes every exported PDF of one resume (used when the resume version is deleted). */
export function deleteResumePdfs(resumeId: number): void {
  try {
    const folder = new Directory(Paths.document, RESUMES_DIR, String(resumeId));
    if (folder.exists) folder.delete();
  } catch (e) {
    console.warn('[pdf] could not delete resume folder', resumeId, e);
  }
}

/** Reset all data (FR-L3): deletes every exported resume PDF. */
export function deleteAllResumePdfs(): void {
  try {
    const folder = new Directory(Paths.document, RESUMES_DIR);
    if (folder.exists) folder.delete();
  } catch (e) {
    console.warn('[pdf] could not delete resumes folder', e);
  }
}
