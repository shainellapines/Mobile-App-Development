import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, MIN_TOUCH_SIZE, Spacing } from '@/constants/theme';

type CheckboxProps = {
  label: string;
  /** Optional second line under the label. */
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/** Tappable row with a checkbox and a label. The whole row is the touch target. */
export function Checkbox({ label, description, checked, onChange }: CheckboxProps) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <Ionicons
        name={checked ? 'checkbox' : 'square-outline'}
        size={FontSize.xl}
        color={checked ? Colors.primary : Colors.mutedText}
      />
      <View style={styles.text}>
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
        {description ? (
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    minHeight: MIN_TOUCH_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  pressed: {
    opacity: 0.6,
  },
  text: {
    flex: 1,
  },
  label: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  description: {
    fontSize: FontSize.xs,
    color: Colors.mutedText,
  },
});
