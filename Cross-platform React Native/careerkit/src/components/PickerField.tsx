import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState, type ComponentProps } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Colors, FontSize, FontWeight, MIN_TOUCH_SIZE, Radius, Spacing } from '@/constants/theme';

export type PickerFieldProps = {
  label: string;
  /** 'date' = calendar, 'time' = clock. */
  mode: 'date' | 'time';
  /** Text shown in the box ('' = empty, so the placeholder shows). */
  displayText: string;
  /** Where the picker starts when it opens. */
  initialValue: Date;
  /** Called with the picked Date. */
  onPick: (date: Date) => void;
  /** If given, an "x" button appears (only while there is a value) and calls this. */
  onClear?: () => void;
  placeholder: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  error?: string;
  required?: boolean;
};

/**
 * The shared part of DateField and TimeField: a tappable box that opens the phone's native picker.
 * - Android: the system dialog (calendar or clock).
 * - iOS: the picker inside a small pop-up with Cancel / Done.
 */
export function PickerField({
  label,
  mode,
  displayText,
  initialValue,
  onPick,
  onClear,
  placeholder,
  icon,
  error,
  required = false,
}: PickerFieldProps) {
  const [iosVisible, setIosVisible] = useState(false);
  // The value highlighted in the iOS pop-up before the user presses Done.
  const [iosDraft, setIosDraft] = useState<Date>(initialValue);

  const open = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initialValue,
        mode,
        is24Hour: false,
        onValueChange: (_event, date) => onPick(date),
      });
    } else {
      setIosDraft(initialValue);
      setIosVisible(true);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <View style={[styles.input, error ? styles.inputError : undefined]}>
        <Pressable
          onPress={open}
          style={styles.pressArea}
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${displayText || 'not set'}`}
          accessibilityHint={`Opens a ${mode} picker`}>
          <Ionicons name={icon} size={FontSize.lg} color={Colors.mutedText} />
          <Text style={displayText ? styles.valueText : styles.placeholder}>{displayText || placeholder}</Text>
        </Pressable>
        {onClear && displayText ? (
          <Pressable
            onPress={onClear}
            style={styles.clear}
            accessibilityRole="button"
            accessibilityLabel={`Clear ${label}`}>
            <Ionicons name="close-circle" size={FontSize.lg} color={Colors.mutedText} />
          </Pressable>
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {Platform.OS === 'ios' ? (
        <Modal visible={iosVisible} transparent animationType="fade" onRequestClose={() => setIosVisible(false)}>
          <View style={styles.backdrop}>
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <DateTimePicker
                value={iosDraft}
                mode={mode}
                display={mode === 'date' ? 'inline' : 'spinner'}
                accentColor={Colors.primary}
                onValueChange={(_event, date) => setIosDraft(date)}
              />
              <View style={styles.actions}>
                <View style={styles.flex}>
                  <Button title="Cancel" variant="secondary" onPress={() => setIosVisible(false)} />
                </View>
                <View style={styles.flex}>
                  <Button
                    title="Done"
                    onPress={() => {
                      onPick(iosDraft);
                      setIosVisible(false);
                    }}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
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
  required: {
    color: Colors.danger,
  },
  input: {
    minHeight: MIN_TOUCH_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.control,
    backgroundColor: Colors.surface,
  },
  inputError: {
    borderColor: Colors.danger,
  },
  pressArea: {
    flex: 1,
    minHeight: MIN_TOUCH_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  valueText: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  placeholder: {
    fontSize: FontSize.md,
    color: Colors.mutedText,
  },
  clear: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    fontSize: FontSize.xs,
    color: Colors.danger,
  },
  backdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sheetTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  flex: {
    flex: 1,
  },
});
