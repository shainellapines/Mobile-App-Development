import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import {
  ATTACHMENT_MIME_TYPES,
  ATTACHMENTS_DIR,
  MAX_FILE_BYTES,
  MAX_FILE_MB,
  PHOTO_QUALITY,
} from '@/constants/files';

/**
 * fileService: the only place that talks to the phone's file system, pickers, and sharing.
 * Screens and hooks call these functions instead of using the native APIs directly (Section 9).
 */

/** A file the user just picked. Its uri points to a TEMPORARY copy that the OS may delete. */
export type PickedFile = {
  uri: string;
  name: string;
  mimeType: string | null;
  sizeBytes: number | null;
};

/** A file after it was copied into our attachments folder. */
export type StoredFile = {
  /** Relative path, e.g. "attachments/1730900000-ab12.pdf". This is what the DB stores. */
  path: string;
  name: string;
  mimeType: string | null;
  sizeBytes: number;
};

/** Thrown when a file is bigger than MAX_FILE_MB, so the UI can show a clear message. */
export class FileTooLargeError extends Error {
  constructor() {
    super(`The file is larger than ${MAX_FILE_MB} MB.`);
    this.name = 'FileTooLargeError';
  }
}

/** Thrown when the user refuses camera or photo access. */
export class PermissionDeniedError extends Error {
  constructor(what: 'camera' | 'photos') {
    super(`CareerKit needs ${what === 'camera' ? 'camera' : 'photo library'} access for this.`);
    this.name = 'PermissionDeniedError';
  }
}

// ── Paths ───────────────────────────────────────────────────────────────────

/**
 * Relative path → full file URI on this device.
 * We store RELATIVE paths in the database because on iOS the absolute path of the app's
 * documents folder can change after an app update; the relative part never changes.
 */
export function toFileUri(path: string): string {
  return new File(Paths.document, path).uri;
}

// ── Picking (returns null if the user cancels) ──────────────────────────────

/** Opens the file browser for a PDF or image. */
export async function pickDocument(): Promise<PickedFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ATTACHMENT_MIME_TYPES,
    // Android: keep the picker's own content:// link instead of letting it copy the file into a
    // cache folder. In Expo Go that cache folder is outside our app's sandbox, so expo-file-system
    // refuses to read it ("Missing READ permission"). We copy the file ourselves right after.
    // iOS: the picker copies into our own sandbox cache, which works everywhere.
    copyToCacheDirectory: Platform.OS !== 'android',
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  return {
    uri: asset.uri,
    name: asset.name,
    mimeType: asset.mimeType ?? null,
    sizeBytes: asset.size ?? null,
  };
}

/** Opens the photo gallery. `square` crops to 1:1 (used for the profile photo). */
export async function pickFromGallery(square = false): Promise<PickedFile | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new PermissionDeniedError('photos');

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: PHOTO_QUALITY,
    allowsEditing: square,
    aspect: square ? [1, 1] : undefined,
  });
  return result.canceled ? null : fromImageAsset(result.assets[0]);
}

/** Opens the camera. `square` crops to 1:1 (used for the profile photo). */
export async function takePhoto(square = false): Promise<PickedFile | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) throw new PermissionDeniedError('camera');

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: PHOTO_QUALITY,
    allowsEditing: square,
    aspect: square ? [1, 1] : undefined,
  });
  return result.canceled ? null : fromImageAsset(result.assets[0]);
}

/** Where a new file comes from. */
export type AttachmentSource = 'document' | 'gallery' | 'camera';

/** Opens the right picker for the chosen source. */
export function pickFrom(source: AttachmentSource, square = false): Promise<PickedFile | null> {
  if (source === 'document') return pickDocument();
  if (source === 'gallery') return pickFromGallery(square);
  return takePhoto(square);
}

function fromImageAsset(asset: ImagePicker.ImagePickerAsset): PickedFile {
  return {
    uri: asset.uri,
    // Camera photos often have no name, so we make a readable one.
    name: asset.fileName ?? `Photo ${new Date().toLocaleDateString()}.jpg`,
    mimeType: asset.mimeType ?? 'image/jpeg',
    sizeBytes: asset.fileSize ?? null,
  };
}

// ── Saving & deleting ───────────────────────────────────────────────────────

/** "report.PDF" → "pdf"; falls back to the MIME type, then "bin". */
function extensionOf(file: PickedFile): string {
  const fromName = file.name.includes('.') ? file.name.split('.').pop() : undefined;
  if (fromName) return fromName.toLowerCase();
  if (file.mimeType === 'application/pdf') return 'pdf';
  if (file.mimeType?.startsWith('image/')) return file.mimeType.split('/')[1];
  return 'bin';
}

/**
 * Copies a picked file into our private attachments folder (FR-D2) and checks its size (FR-D4).
 * The copy gets a unique name (time + random letters) so two files can never overwrite each other.
 */
export async function saveToAttachments(picked: PickedFile): Promise<StoredFile> {
  const source = new File(picked.uri);
  // Some pickers do not report the size, so ask the file system.
  const sizeBytes = picked.sizeBytes ?? source.size;
  if (sizeBytes > MAX_FILE_BYTES) throw new FileTooLargeError();

  const folder = new Directory(Paths.document, ATTACHMENTS_DIR);
  if (!folder.exists) folder.create({ intermediates: true });

  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensionOf(picked)}`;
  const destination = new File(folder, uniqueName);
  await source.copy(destination);

  return {
    path: `${ATTACHMENTS_DIR}/${uniqueName}`,
    name: picked.name,
    mimeType: picked.mimeType,
    sizeBytes,
  };
}

/**
 * Deletes stored files. Never throws: a missing file is already "deleted",
 * and a failed cleanup should not block the user (we just log it).
 */
export function deleteStoredFiles(paths: string[]): void {
  for (const path of paths) {
    try {
      const file = new File(Paths.document, path);
      if (file.exists) file.delete();
    } catch (e) {
      console.warn('[files] could not delete', path, e);
    }
  }
}

// ── Opening ─────────────────────────────────────────────────────────────────

/**
 * Opens a stored file outside the app (used for PDFs; images are shown in-app).
 * 1. Try the phone's built-in previewer.
 * 2. If it cannot preview this file, open the Share sheet so the user can pick an app.
 */
export async function openStoredFile(path: string, mimeType: string | null, title?: string): Promise<void> {
  const file = new File(Paths.document, path);
  if (!file.exists) throw new Error('File is missing');

  const options = { mimeType: mimeType ?? undefined, title };
  if (await file.canPreview(options)) {
    await file.preview(options);
    return;
  }
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: mimeType ?? undefined, dialogTitle: title });
    return;
  }
  throw new Error('No app can open this file');
}

/** "2.4 MB", "820 KB" — for showing file sizes. */
export function formatFileSize(bytes: number | null): string {
  if (bytes === null) return '';
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** True for image MIME types, so the UI can show a thumbnail instead of a file icon. */
export function isImage(mimeType: string | null): boolean {
  return Boolean(mimeType?.startsWith('image/'));
}

/** Turns a file error into a short message the user can act on. */
export function fileErrorMessage(e: unknown): string {
  if (e instanceof FileTooLargeError) return `Please choose a file smaller than ${MAX_FILE_MB} MB.`;
  if (e instanceof PermissionDeniedError) return `${e.message} You can allow it in your phone's Settings.`;
  const generic = 'Something went wrong with this file. Please try again.';
  // While developing, show the real error so problems are easy to find. Users never see this.
  return __DEV__ && e instanceof Error ? `${generic}

(Details: ${e.message})` : generic;
}

/** Reset all data (FR-L3): deletes the whole attachments folder (every attached file and profile photo). */
export function deleteAllAttachments(): void {
  try {
    const folder = new Directory(Paths.document, ATTACHMENTS_DIR);
    if (folder.exists) folder.delete();
  } catch (e) {
    console.warn('[files] could not delete attachments folder', e);
  }
}

/**
 * Reads a stored image as a "data:image/jpeg;base64,..." text, so it can be placed INSIDE
 * an HTML page (used for the photo on the Modern resume). Returns null if it cannot be read.
 */
export async function readImageAsDataUri(path: string): Promise<string | null> {
  try {
    const file = new File(Paths.document, path);
    if (!file.exists) return null;
    const lower = path.toLowerCase();
    const mime = lower.endsWith('.png') ? 'image/png' : lower.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
    return `data:${mime};base64,${await file.base64()}`;
  } catch (e) {
    console.warn('[files] could not read image', path, e);
    return null;
  }
}
