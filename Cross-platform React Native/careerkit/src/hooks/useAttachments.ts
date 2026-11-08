import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';

import { createAttachment, deleteAttachment, listAttachments } from '@/db/repositories/attachmentRepo';
import {
  deleteStoredFiles,
  pickFrom,
  saveToAttachments,
  type AttachmentSource,
} from '@/services/fileService';
import type { Attachment, AttachmentOwnerType } from '@/types/attachment';

/**
 * Files attached to one record (Document Locker, FR-D1–D3).
 * add() and replace() return false if the user cancelled the picker.
 * They throw on errors (file too large, permission denied, ...) so the UI can explain.
 */
export function useAttachments(ownerType: AttachmentOwnerType, ownerId: number) {
  const db = useSQLiteContext();
  const [items, setItems] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setItems(await listAttachments(db, ownerType, ownerId));
    } catch (e) {
      console.warn('[attachments] list failed', e);
    } finally {
      setLoading(false);
    }
  }, [db, ownerType, ownerId]);

  useEffect(() => {
    // Load once when the form opens. (The async call sets state later, not during the effect.)
    listAttachments(db, ownerType, ownerId)
      .then(setItems)
      .catch((e) => console.warn('[attachments] list failed', e))
      .finally(() => setLoading(false));
  }, [db, ownerType, ownerId]);

  /** Pick → copy into our folder → save a DB row. Returns false if cancelled. */
  const add = useCallback(
    async (source: AttachmentSource): Promise<boolean> => {
      const picked = await pickFrom(source);
      if (!picked) return false;

      const stored = await saveToAttachments(picked);
      try {
        await createAttachment(db, {
          ownerType,
          ownerId,
          fileUri: stored.path,
          fileName: stored.name,
          mimeType: stored.mimeType,
          sizeBytes: stored.sizeBytes,
        });
      } catch (e) {
        // The DB insert failed, so the copied file would be an orphan: remove it.
        deleteStoredFiles([stored.path]);
        throw e;
      }
      await refresh();
      return true;
    },
    [db, ownerType, ownerId, refresh]
  );

  /** Deletes the DB row first, then the file. */
  const remove = useCallback(
    async (attachmentId: number) => {
      const path = await deleteAttachment(db, attachmentId);
      if (path) deleteStoredFiles([path]);
      await refresh();
    },
    [db, refresh]
  );

  /** Replace = add the new file; only if that worked, remove the old one (FR-D3). */
  const replace = useCallback(
    async (attachmentId: number, source: AttachmentSource): Promise<boolean> => {
      const added = await add(source);
      if (added) await remove(attachmentId);
      return added;
    },
    [add, remove]
  );

  return { items, loading, add, remove, replace };
}
