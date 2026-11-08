import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useState, type ComponentProps } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FieldHint } from '@/components/FieldHint';
import { ImageViewer } from '@/components/ImageViewer';
import { SectionTitle } from '@/components/SectionTitle';
import { afterModalCloses, SourceChooser } from '@/components/SourceChooser';
import { MAX_FILE_MB } from '@/constants/files';
import { Colors, FontSize, FontWeight, MIN_TOUCH_SIZE, Radius, Spacing } from '@/constants/theme';
import { useAttachments } from '@/hooks/useAttachments';
import {
  fileErrorMessage,
  type AttachmentSource,
  formatFileSize,
  isImage,
  openStoredFile,
  toFileUri,
} from '@/services/fileService';
import type { Attachment, AttachmentOwnerType } from '@/types/attachment';

const THUMB_SIZE = 48;

type AttachmentPickerProps = {
  ownerType: AttachmentOwnerType;
  /** undefined while adding a new entry: files can only be attached after the first save. */
  ownerId: number | undefined;
};

/** "Attachments" section of a form (Document Locker, FR-D1–D4). */
export function AttachmentPicker({ ownerType, ownerId }: AttachmentPickerProps) {
  if (ownerId === undefined) {
    return (
      <Card>
        <SectionTitle title="Attachments" />
        <FieldHint>Save this entry first, then you can attach files (certificates, photos, PDFs).</FieldHint>
      </Card>
    );
  }
  return <AttachmentList ownerType={ownerType} ownerId={ownerId} />;
}

/** What the source pop-up is for: adding a new file, or replacing an existing one. */
type ChooserMode = { kind: 'add' } | { kind: 'replace'; attachmentId: number } | null;

function AttachmentList({ ownerType, ownerId }: { ownerType: AttachmentOwnerType; ownerId: number }) {
  const { items, loading, add, remove, replace } = useAttachments(ownerType, ownerId);
  const [chooser, setChooser] = useState<ChooserMode>(null);
  const [busy, setBusy] = useState(false);
  const [viewing, setViewing] = useState<Attachment | null>(null);
  const [toDelete, setToDelete] = useState<Attachment | null>(null);

  /** Runs a file operation with a spinner and a friendly error message. */
  const runFileTask = async (task: () => Promise<boolean>, successMessage: string) => {
    setBusy(true);
    try {
      const done = await task();
      if (done) Alert.alert('Done', successMessage);
    } catch (e) {
      console.warn('[attachments] file task failed', e);
      Alert.alert('Could not attach file', fileErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const handleChoose = (source: AttachmentSource) => {
    const mode = chooser;
    setChooser(null);
    afterModalCloses(() => {
      if (mode?.kind === 'add') {
        runFileTask(() => add(source), 'File attached.');
      } else if (mode?.kind === 'replace') {
        runFileTask(() => replace(mode.attachmentId, source), 'File replaced.');
      }
    });
  };

  const handleOpen = async (item: Attachment) => {
    if (isImage(item.mimeType)) {
      setViewing(item);
      return;
    }
    try {
      await openStoredFile(item.fileUri, item.mimeType, item.fileName);
    } catch (e) {
      console.warn('[attachments] open failed', e);
      Alert.alert('Could not open file', 'This file could not be opened on this phone.');
    }
  };

  const handleDelete = async () => {
    const item = toDelete;
    setToDelete(null);
    if (!item) return;
    try {
      await remove(item.id);
    } catch (e) {
      console.warn('[attachments] delete failed', e);
      Alert.alert('Could not delete', 'Something went wrong while deleting the file.');
    }
  };

  return (
    <Card>
      <SectionTitle title="Attachments" />

      {loading ? <ActivityIndicator color={Colors.primary} /> : null}
      {!loading && items.length === 0 ? (
        <FieldHint>No files yet. Attach a certificate, ID, or proof as a PDF or photo.</FieldHint>
      ) : null}

      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <Pressable
            onPress={() => handleOpen(item)}
            style={({ pressed }) => [styles.open, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.fileName}`}>
            {isImage(item.mimeType) ? (
              <Image source={{ uri: toFileUri(item.fileUri) }} style={styles.thumb} contentFit="cover" />
            ) : (
              <View style={[styles.thumb, styles.fileIcon]}>
                <Ionicons name="document-text-outline" size={FontSize.xl} color={Colors.primary} />
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {item.fileName}
              </Text>
              <Text style={styles.size}>{formatFileSize(item.sizeBytes)}</Text>
            </View>
          </Pressable>
          <IconButton
            icon="swap-horizontal-outline"
            label={`Replace ${item.fileName}`}
            onPress={() => setChooser({ kind: 'replace', attachmentId: item.id })}
          />
          <IconButton
            icon="trash-outline"
            label={`Delete ${item.fileName}`}
            color={Colors.danger}
            onPress={() => setToDelete(item)}
          />
        </View>
      ))}

      <Button
        title="Attach file"
        icon="attach"
        variant="secondary"
        loading={busy}
        onPress={() => setChooser({ kind: 'add' })}
      />
      <FieldHint>{`PDF or image, up to ${MAX_FILE_MB} MB each. Files stay on this phone only.`}</FieldHint>

      <SourceChooser
        visible={chooser !== null}
        title={chooser?.kind === 'replace' ? 'Replace with…' : 'Attach a file'}
        onChoose={handleChoose}
        onCancel={() => setChooser(null)}
      />
      <ImageViewer
        uri={viewing ? toFileUri(viewing.fileUri) : null}
        title={viewing?.fileName}
        onClose={() => setViewing(null)}
      />
      <ConfirmDialog
        visible={toDelete !== null}
        title="Delete this file?"
        message={toDelete ? `"${toDelete.fileName}" will be removed from this phone.` : undefined}
        confirmLabel="Delete"
        destructive
        onCancel={() => setToDelete(null)}
        onConfirm={handleDelete}
      />
    </Card>
  );
}

type IconButtonProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  color?: string;
};

function IconButton({ icon, label, onPress, color = Colors.mutedText }: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Ionicons name={icon} size={FontSize.lg} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  open: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: MIN_TOUCH_SIZE,
    borderRadius: Radius.control,
  },
  pressed: {
    opacity: 0.6,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: Radius.control,
    backgroundColor: Colors.surfaceContainer,
  },
  fileIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  size: {
    fontSize: FontSize.xs,
    color: Colors.mutedText,
  },
  iconButton: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
