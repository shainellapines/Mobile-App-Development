import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Colors, FontSize, FontWeight, MIN_TOUCH_SIZE, Radius, Spacing } from '@/constants/theme';
import { formatDate, parseIsoDate, toIsoDate } from '@/utils/dates';

type DateFieldProps = {
  label: string;
  /** Selected date as "yyyy-MM-dd", or null when empty. */
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  /** Shows an "x" button to clear the date (e.g., end date empty = "Present"). */
  clearable?: boolean;
};

/**
 * Tappable date input. Opens the phone's native date picker:
 * - Android: the system calendar dialog.
 * - iOS: a calendar inside a small pop-up with Cancel / Done.
 * Screens only deal with "yyyy-MM-dd" strings; the Date objects stay inside this component.
 */
export function DateField({
  label,
  value,
  onChange,
  placeholder = 'Select a date',
  error,
  required = false,
  clearable = false,
}: DateFieldProps) {
  const [iosVisible, setIosVisible] = useState(false);
  // The date highlighted in the iOS pop-up before the user presses Done.
  const [iosDraft, setIosDraft] = useState<Date>(new Date());

  const open = () => {
    const current = parseIsoDate(value) ?? new Date();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode: 'date',
        onValueChange: (_event, date) => onChange(toIsoDate(date)),
      });
    } else {
      setIosDraft(current);
      setIosVisible(true);
    }
  };

  const displayText = formatDate(value);

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
          accessibilityHint="Opens a date picker">
          <Ionicons name="calendar-outline" size={FontSize.lg} color={Colors.mutedText} />
          <Text style={displayText ? styles.valueText : styles.placeholder}>
            {displayText || placeholder}
          </Text>
        </Pressable>
        {clearable && value ? (
          <Pressable
            onPress={() => onChange(null)}
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
                mode="date"
                display="inline"
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
                      onChange(toIsoDate(iosDraft));
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
