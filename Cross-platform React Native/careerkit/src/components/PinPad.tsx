import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, FontWeight, MIN_TOUCH_SIZE, Radius, Spacing } from '@/constants/theme';

const KEY_SIZE = MIN_TOUCH_SIZE + Spacing.xl; // 68: big, easy-to-hit number keys
const DOT_SIZE = Spacing.md + 2;

type PinPadProps = {
  /** Digits typed so far, e.g. "12". */
  value: string;
  onChange: (value: string) => void;
  /** How many dots to show and the most digits accepted. */
  maxLength: number;
  /** If given, the bottom-left key shows a fingerprint / face icon that calls this. */
  onBiometric?: () => void;
  biometricIcon?: ComponentProps<typeof Ionicons>['name'];
  biometricLabel?: string;
  /** Greys out the keypad (e.g. after too many wrong PINs). */
  disabled?: boolean;
};

const ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

/**
 * On-screen number pad with PIN dots. Our own keypad (instead of a text box)
 * keeps the PIN off the keyboard's suggestions and looks the same on every phone.
 */
export function PinPad({
  value,
  onChange,
  maxLength,
  onBiometric,
  biometricIcon = 'finger-print',
  biometricLabel = 'Use biometrics',
  disabled = false,
}: PinPadProps) {
  const press = (digit: string) => {
    if (value.length < maxLength) onChange(value + digit);
  };

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      <View style={styles.dots} accessibilityLabel={`${value.length} of ${maxLength} digits entered`}>
        {Array.from({ length: maxLength }, (_, i) => (
          <View key={i} style={[styles.dot, i < value.length && styles.dotFilled]} />
        ))}
      </View>

      {ROWS.map((row) => (
        <View key={row.join('')} style={styles.row}>
          {row.map((digit) => (
            <Key key={digit} label={digit} onPress={() => press(digit)} disabled={disabled} />
          ))}
        </View>
      ))}

      <View style={styles.row}>
        {onBiometric ? (
          <Key icon={biometricIcon} accessibilityLabel={biometricLabel} onPress={onBiometric} disabled={disabled} />
        ) : (
          <View style={styles.key} />
        )}
        <Key label="0" onPress={() => press('0')} disabled={disabled} />
        <Key
          icon="backspace-outline"
          accessibilityLabel="Delete last digit"
          onPress={() => onChange(value.slice(0, -1))}
          disabled={disabled || value.length === 0}
        />
      </View>
    </View>
  );
}

type KeyProps = {
  label?: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  accessibilityLabel?: string;
  onPress: () => void;
  disabled: boolean;
};

function Key({ label, icon, accessibilityLabel, onPress, disabled }: KeyProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [styles.key, styles.keyButton, pressed && styles.pressed]}>
      {icon ? (
        <Ionicons name={icon} size={FontSize.xl} color={Colors.primary} />
      ) : (
        <Text style={styles.keyText}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  disabled: {
    opacity: 0.4,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  dotFilled: {
    backgroundColor: Colors.primary,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  key: {
    width: KEY_SIZE,
    height: KEY_SIZE,
  },
  keyButton: {
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  pressed: {
    backgroundColor: Colors.border,
  },
});
