import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, FontWeight, MIN_TOUCH_SIZE, Radius, Spacing } from '@/constants/theme';

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

type SelectProps<T extends string> = {
  label: string;
  options: readonly SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * Pick one option from a short list, shown as tappable "chips".
 * Generic <T> means the value keeps its exact type (e.g., 'job' | 'ojt'), not just string.
 */
export function Select<T extends string>({ label, options, value, onChange }: SelectProps<T>) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.chipSelected,
                pressed && styles.pressed,
              ]}>
              {/* MD3 filter chip: a check mark shows which option is selected (not color alone). */}
              {selected ? <Ionicons name="checkmark" size={FontSize.md} color={Colors.onSecondaryContainer} /> : null}
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    minHeight: MIN_TOUCH_SIZE,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.chip,
    borderWidth: 1,
    borderColor: Colors.outline,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  chipSelected: {
    backgroundColor: Colors.secondaryContainer,
    borderColor: Colors.secondaryContainer,
  },
  pressed: {
    opacity: 0.7,
  },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  chipTextSelected: {
    color: Colors.onSecondaryContainer,
    fontWeight: FontWeight.semibold,
  },
});
