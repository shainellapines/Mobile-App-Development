import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Colors, FontSize, FontWeight, MIN_TOUCH_SIZE, Radius, Spacing } from '@/constants/theme';
import type { AttachmentSource } from '@/services/fileService';

const OPTIONS: { source: AttachmentSource; label: string; icon: ComponentProps<typeof Ionicons>['name'] }[] = [
  { source: 'document', label: 'Choose a file (PDF or image)', icon: 'document-outline' },
  { source: 'gallery', label: 'Choose from photos', icon: 'images-outline' },
  { source: 'camera', label: 'Take a photo', icon: 'camera-outline' },
];

/**
 * iOS cannot open a picker while our pop-up is still sliding closed, so after closing the
 * SourceChooser, wait for the animation before opening the picker. Android can open it right away.
 */
export function afterModalCloses(action: () => void) {
  setTimeout(action, Platform.OS === 'ios' ? 400 : 0);
}

type SourceChooserProps = {
  visible: boolean;
  title: string;
  /** Which sources to offer. The profile photo, for example, has no "file" option. */
  sources?: AttachmentSource[];
  onChoose: (source: AttachmentSource) => void;
  onCancel: () => void;
};

/** Bottom pop-up asking where a new file should come from. */
export function SourceChooser({
  visible,
  title,
  sources = ['document', 'gallery', 'camera'],
  onChoose,
  onCancel,
}: SourceChooserProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel="Close">
        {/* Inner Pressable stops taps on the sheet from closing it. */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          {OPTIONS.filter((o) => sources.includes(o.source)).map((o) => (
            <Pressable
              key={o.source}
              onPress={() => onChoose(o.source)}
              accessibilityRole="button"
              style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
              <Ionicons name={o.icon} size={FontSize.lg} color={Colors.primary} />
              <Text style={styles.optionText}>{o.label}</Text>
            </Pressable>
          ))}
          <View style={styles.cancel}>
            <Button title="Cancel" variant="secondary" onPress={onCancel} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: Colors.overlay,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.tile, // MD3 bottom sheet
    borderTopRightRadius: Radius.tile,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xs,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  option: {
    minHeight: MIN_TOUCH_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.control,
  },
  pressed: {
    backgroundColor: Colors.primaryContainer,
  },
  optionText: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  cancel: {
    marginTop: Spacing.sm,
  },
});
