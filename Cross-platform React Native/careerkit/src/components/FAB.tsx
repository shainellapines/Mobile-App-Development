import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

const FAB_SIZE = 56;

type FABProps = {
  onPress: () => void;
  /** Read aloud by screen readers, e.g. "Add experience". */
  accessibilityLabel: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
};

/**
 * Floating Action Button: the round "+" button in the bottom-right corner of every list (Section 8.3).
 * Place it as the last child of a screen so it floats above the list.
 */
export function FAB({ onPress, accessibilityLabel, icon = 'add' }: FABProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}>
      <Ionicons name={icon} size={FontSize.xl + 4} color={Colors.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: Spacing.xl,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: Radius.pill,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow: iOS uses shadow*, Android uses elevation
    shadowColor: Colors.text,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  pressed: {
    opacity: 0.85,
  },
});
