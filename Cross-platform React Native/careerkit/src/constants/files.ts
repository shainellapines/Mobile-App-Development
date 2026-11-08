/** Largest file a user may attach (FR-D4). */
export const MAX_FILE_MB = 10;
export const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

/** Folder inside the app's private documents directory where attachments are kept (FR-D2). */
export const ATTACHMENTS_DIR = 'attachments';

/** File types the document picker allows: PDFs and any image. */
export const ATTACHMENT_MIME_TYPES = ['application/pdf', 'image/*'];

/** JPEG quality (0–1) for photos from the camera/gallery: smaller files, still sharp. */
export const PHOTO_QUALITY = 0.8;
