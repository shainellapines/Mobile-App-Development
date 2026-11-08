import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { afterModalCloses, SourceChooser } from '@/components/SourceChooser';
import { Colors, Spacing } from '@/constants/theme';
import { fileErrorMessage, toFileUri, type AttachmentSource } from '@/services/fileService';

const PHOTO_SIZE = 112;

type ProfilePhotoPickerProps = {
  /** Saved photo path (relative), or null when there is no photo. */
  photoPath: string | null;
  /** Returns false if the user cancelled. */
  onChange: (source: AttachmentSource) => Promise<boolean>;
  onRemove: () => Promise<void>;
};

/** Round profile photo with "Change" / "Remove" buttons. The photo is saved immediately. */
export function ProfilePhotoPicker({ photoPath, onChange, onRemove }: ProfilePhotoPickerProps) {
  const [chooserVisible, setChooserVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = async (task: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await task();
    } catch (e) {
      console.warn('[profile] photo failed', e);
      Alert.alert('Could not update photo', fileErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.photo}>
        {busy ? (
          <ActivityIndicator color={Colors.primary} />
        ) : photoPath ? (
          <Image
            source={{ uri: toFileUri(photoPath) }}
            style={styles.photo}
            contentFit="cover"
            accessibilityLabel="Profile photo"
          />
        ) : (
          <Ionicons name="person" size={PHOTO_SIZE / 2} color={Colors.onPrimaryContainer} />
        )}
      </View>

      <View style={styles.buttons}>
        <Button
          title={photoPath ? 'Change photo' : 'Add photo'}
          icon="camera-outline"
          variant="secondary"
          disabled={busy}
          onPress={() => setChooserVisible(true)}
        />
        {photoPath ? (
          <Button title="Remove" variant="secondary" disabled={busy} onPress={() => run(onRemove)} />
        ) : null}
      </View>

      <SourceChooser
        visible={chooserVisible}
        title="Profile photo"
        sources={['gallery', 'camera']}
        onCancel={() => setChooserVisible(false)}
        onChoose={(source) => {
          setChooserVisible(false);
          afterModalCloses(() => run(() => onChange(source)));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
