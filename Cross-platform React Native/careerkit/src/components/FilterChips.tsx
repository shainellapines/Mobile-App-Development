import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Colors, FontSize, FontWeight, MIN_TOUCH_SIZE, Radius, Spacing } from '@/constants/theme';

export type FilterOption<T extends string> = {
  value: T;
  label: string;
};

type FilterChipsProps<T extends string> = {
  /** Read by screen readers, e.g. "Filter by status". */
  accessibilityLabel: string;
  options: readonly FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** One row of filter buttons that scrolls sideways when it does not fit (FR-Q6, FR-A3). */
export function FilterChips<T extends string>({ accessibilityLabel, options, value, onChange }: FilterChipsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}>
            <Text style={[styles.text, selected && styles.selectedText]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: Spacing.sm,
  },
  chip: {
    minHeight: MIN_TOUCH_SIZE,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  selected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  text: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  selectedText: {
    color: Colors.onPrimary,
    fontWeight: FontWeight.semibold,
  },
});
