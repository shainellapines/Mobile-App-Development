import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Colors, FontSize, FontWeight, MIN_TOUCH_SIZE, Radius, Spacing } from '@/constants/theme';

type TextFieldProps = TextInputProps & {
  label: string;
  /** Inline validation message shown under the input (FR-V3). */
  error?: string;
  /** Adds a red asterisk to the label. */
  required?: boolean;
};

/** Labeled text input with an optional inline error. Accepts all normal TextInput props. */
export function TextField({ label, error, required = false, multiline, style, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={Colors.mutedText}
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.multiline,
          error ? styles.inputError : undefined,
          style,
        ]}
        {...inputProps}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.control,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  multiline: {
    minHeight: MIN_TOUCH_SIZE * 2.5,
    textAlignVertical: 'top', // Android: start typing at the top, not the middle
  },
  inputError: {
    borderColor: Colors.danger,
  },
  error: {
    fontSize: FontSize.xs,
    color: Colors.danger,
  },
});
