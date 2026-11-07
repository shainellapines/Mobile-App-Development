import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppLogo } from '@/components/AppLogo';
import { Colors, FontSize, FontWeight, MIN_TOUCH_SIZE, Radius, Spacing } from '@/constants/theme';

const BADGE_SIZE = 36;
const MARK_SIZE = 30;

/**
 * Title of the main tab screens (MD3 "small top app bar" style, left-aligned):
 * the logo in a small white badge, then the screen title.
 * The white badge keeps the light glass logo visible on the grey header.
 */
export function BrandHeaderTitle({ title }: { title: string }) {
  return (
    <View style={styles.row} accessibilityRole="header">
      <View style={styles.badge}>
        <AppLogo size={MARK_SIZE} />
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
    </View>
  );
}

/** Round icon button for the header's right side (44×44 touch area). */
export function HeaderIconButton({
  icon,
  label,
  onPress,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={Spacing.xs}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
      <Ionicons name={icon} size={FontSize.lg + 2} color={Colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: Radius.control,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  iconButton: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  pressed: {
    backgroundColor: Colors.primaryContainer,
  },
});
