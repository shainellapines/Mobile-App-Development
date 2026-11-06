/** Which kind of record an attachment belongs to (attachments.owner_type). */
export type AttachmentOwnerType =
  | 'certification'
  | 'project'
  | 'education'
  | 'experience'
  | 'requirement'
  | 'ojt_requirement';

/** One row of the `attachments` table, in camelCase. */
export type Attachment = {
  id: number;
  ownerType: AttachmentOwnerType;
  ownerId: number;
  /**
   * Path RELATIVE to the app's documents folder, e.g. "attachments/1730900000-ab12.pdf".
   * Use fileService.toFileUri() to turn it into a full URI for display.
   */
  fileUri: string;
  /** The original name the user saw when picking, e.g. "NBI Clearance.pdf". */
  fileName: string;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
  updatedAt: string;
};

export type NewAttachment = Omit<Attachment, 'id' | 'createdAt' | 'updatedAt'>;
