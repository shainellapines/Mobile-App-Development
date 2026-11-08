import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, FontWeight, MIN_TOUCH_SIZE, Radius, Spacing } from '@/constants/theme';

type ListItemProps = {
  title: string;
  subtitle?: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  onPress?: () => void;
  /** Greys the row out and ignores taps (e.g., features not built yet). */
  disabled?: boolean;
};

/** A tappable row: icon, title, optional subtitle, and a chevron on the right. */
export function ListItem({ title, subtitle, icon, onPress, disabled = false }: ListItemProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, disabled && styles.disabled]}>
      {icon ? (
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={FontSize.lg} color={Colors.onPrimaryContainer} />
        </View>
      ) : null}
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {onPress && !disabled ? (
        <Ionicons name="chevron-forward" size={FontSize.lg} color={Colors.mutedText} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: MIN_TOUCH_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.control,
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.5,
  },
  iconBox: {
    width: MIN_TOUCH_SIZE - Spacing.xs,
    height: MIN_TOUCH_SIZE - Spacing.xs,
    borderRadius: Radius.control,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.mutedText,
  },
});
