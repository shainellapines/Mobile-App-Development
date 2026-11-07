import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { BUTTON_HEIGHT, Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** Optional Ionicons icon shown before the title. */
  icon?: ComponentProps<typeof Ionicons>['name'];
  disabled?: boolean;
  /** Shows a spinner and blocks presses (e.g., while generating a PDF). */
  loading?: boolean;
};

// MD3 button styles: primary = "filled", secondary = "tonal" (light teal), danger = filled red.
const VARIANT_COLORS: Record<ButtonVariant, { background: string; text: string }> = {
  primary: { background: Colors.primary, text: Colors.onPrimary },
  secondary: { background: Colors.secondaryContainer, text: Colors.onSecondaryContainer },
  danger: { background: Colors.danger, text: Colors.onPrimary },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
}: ButtonProps) {
  const colors = VARIANT_COLORS[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.background },
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}>
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={FontSize.lg} color={colors.text} />}
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: BUTTON_HEIGHT,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});
