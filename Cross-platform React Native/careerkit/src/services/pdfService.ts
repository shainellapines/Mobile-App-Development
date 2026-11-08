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
/** Folder for the exported OJT Daily Time Record. */
const DTR_DIR = 'dtr';

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
 * HTML → PDF file at <folder>/<fileName> inside the app's documents. Returns the relative path.
 *
 * We ask expo-print for the PDF as base64 text and write the file ourselves. On Android,
 * expo-print's own output file sits in a cache folder that Expo Go does not let us read,
 * so reading it would fail (the same problem the document picker had).
 * The folder is emptied first, so only the latest export is kept.
 */
async function printToPdfFile(html: string, folderParts: string[], fileName: string): Promise<string> {
  const result = await Print.printToFileAsync({
    html,
    width: A4_WIDTH,
    height: A4_HEIGHT,
    margins: { top: IOS_MARGIN, bottom: IOS_MARGIN, left: IOS_MARGIN, right: IOS_MARGIN },
    base64: true,
  });
  if (!result.base64) throw new Error('PDF generation returned no data');

  const folder = new Directory(Paths.document, ...folderParts);
  if (folder.exists) folder.delete();
  folder.create({ intermediates: true });

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

  return [...folderParts, fileName].join('/');
}

/** Resume HTML → "resumes/<id>/<Name>_Resume.pdf" (FR-R4). Returns that relative path. */
export function exportResumePdf(resumeId: number, ownerName: string, html: string): Promise<string> {
  return printToPdfFile(html, [RESUMES_DIR, String(resumeId)], `${safeFileName(ownerName)}_Resume.pdf`);
}

/** OJT Daily Time Record HTML → "dtr/<Name>_DTR.pdf" (FR-O5). Returns that relative path. */
export function exportDtrPdf(ownerName: string, html: string): Promise<string> {
  return printToPdfFile(html, [DTR_DIR], `${safeFileName(ownerName)}_DTR.pdf`);
}

/** Opens the Share sheet for a saved PDF (email, Messenger, Drive, ...). */
export async function shareStoredPdf(path: string, title: string): Promise<void> {
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

/** Reset all data (FR-L3): deletes every exported PDF (resumes and DTR). */
export function deleteAllPdfs(): void {
  for (const dir of [RESUMES_DIR, DTR_DIR]) {
    try {
      const folder = new Directory(Paths.document, dir);
      if (folder.exists) folder.delete();
    } catch (e) {
      console.warn('[pdf] could not delete folder', dir, e);
    }
  }
}
