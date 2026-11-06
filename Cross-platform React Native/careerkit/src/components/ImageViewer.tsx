import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, FontSize, MIN_TOUCH_SIZE, Spacing } from '@/constants/theme';

type ImageViewerProps = {
  /** Full file URI of the image, or null to hide the viewer. */
  uri: string | null;
  title?: string;
  onClose: () => void;
};

/** Full-screen, dark background image preview (FR-D3: "images in-app"). */
export function ImageViewer({ uri, title, onClose }: ImageViewerProps) {
  return (
    <Modal visible={uri !== null} animationType="fade" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Pressable onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="Close image">
            <Ionicons name="close" size={FontSize.xl} color={Colors.onPrimary} />
          </Pressable>
        </View>
        {uri ? <Image source={{ uri }} style={styles.image} contentFit="contain" /> : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.text, // near-black, so photos stand out
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  title: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.onPrimary,
  },
  close: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    flex: 1,
  },
});
