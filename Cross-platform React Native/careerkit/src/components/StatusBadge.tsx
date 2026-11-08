import { StyleSheet, Text, View } from 'react-native';

import { FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

type StatusBadgeProps = {
  label: string;
  /** Status color from the theme, e.g. StatusColors.expired. */
  color: string;
};

/**
 * Small colored pill showing a status (Section 8.2), e.g. "Expired" in red.
 * The color is used for the text and border, with a light tint behind it,
 * so the label stays readable for everyone (not color-only information).
 */
export function StatusBadge({ label, color }: StatusBadgeProps) {
  return (
    <View
      style={[styles.badge, { borderColor: color, backgroundColor: `${color}1A` /* ~10% opacity */ }]}
      accessibilityLabel={`Status: ${label}`}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});
