import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import type { FormErrors } from '@/utils/validators';

type UseEntryFormOptions<V, I, R> = {
  /** Starting field values (empty for "add", the saved record for "edit"). */
  initialValues: V;
  /** Returns an error message per invalid field; {} means valid. */
  validate: (values: V) => FormErrors<V>;
  /** Converts form values (plain strings while typing) into what the repository saves. */
  toInput: (values: V) => I;
  /** R = whatever saving returns (e.g. the new id, or reminder info). */
  onSave: (input: I) => Promise<R>;
  /** Only in edit mode. */
  onDelete?: () => Promise<void>;
  /** Used in messages, e.g. "education" → "Your education has been saved." */
  label: string;
  /** Optional: a custom success message built from what onSave returned. */
  successMessage?: (result: R) => string;
};

/**
 * Shared behavior of every vault form, so each form screen only has to lay out its fields:
 * - keeps the field values,
 * - shows errors only after the first Save attempt,
 * - on Save: validate → convert → save → success message → go back,
 * - on Delete: delete → go back.
 */
export function useEntryForm<V, I, R = unknown>({
  initialValues,
  validate,
  toInput,
  onSave,
  onDelete,
  label,
  successMessage,
}: UseEntryFormOptions<V, I, R>) {
  const [values, setValues] = useState<V>(initialValues);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const errors = validate(values);
  const visibleErrors: FormErrors<V> = submitted ? errors : {};

  /** Returns a change handler for one field. The generic K keeps that field's own type. */
  const setField =
    <K extends keyof V>(field: K) =>
    (value: V[K]) =>
      setValues((prev) => ({ ...prev, [field]: value }));

  /**
   * Changes several fields at once, based on the current values.
   * Used when one change affects another, e.g. a new issue date also fills in the expiry date.
   */
  const patchValues = (update: (prev: V) => Partial<V>) =>
    setValues((prev) => ({ ...prev, ...update(prev) }));

  const handleSave = async () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      Alert.alert('Check the form', 'Please fix the highlighted fields.');
      return;
    }

    setSaving(true);
    try {
      const result = await onSave(toInput(values));
      Alert.alert('Saved', successMessage ? successMessage(result) : `Your ${label} has been saved.`);
      router.back();
    } catch (e) {
      console.warn(`[${label}] save failed`, e);
      Alert.alert('Could not save', 'Something went wrong while saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = onDelete
    ? async () => {
        try {
          await onDelete();
          router.back();
        } catch (e) {
          console.warn(`[${label}] delete failed`, e);
          Alert.alert('Could not delete', 'Something went wrong while deleting. Please try again.');
        }
      }
    : undefined;

  return { values, setField, patchValues, errors: visibleErrors, saving, handleSave, handleDelete };
}
