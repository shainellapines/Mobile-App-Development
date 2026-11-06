import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DateField } from '@/components/DateField';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { Select } from '@/components/Select';
import { TextField } from '@/components/TextField';
import { Colors, FontSize } from '@/constants/theme';
import { EXPERIENCE_TYPE_OPTIONS } from '@/constants/vault';
import { useExperience } from '@/hooks/useExperiences';
import type { Experience, ExperienceInput } from '@/types/experience';
import { emptyToNull, validateExperience, type ExperienceFormValues } from '@/utils/validators';

const EMPTY_FORM: ExperienceFormValues = {
  title: '',
  organization: '',
  type: 'job',
  location: '',
  startDate: null,
  endDate: null,
  description: '',
};

function toFormValues(e: Experience): ExperienceFormValues {
  return {
    title: e.title,
    organization: e.organization,
    type: e.type,
    location: e.location ?? '',
    startDate: e.startDate,
    endDate: e.endDate,
    description: e.description ?? '',
  };
}

/**
 * Add / Edit Experience. Opened as /vault/experience/form (add) or
 * /vault/experience/form?id=3 (edit). This outer part reads the id and loads the record.
 */
export default function ExperienceFormScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ? Number(params.id) : undefined;
  const { experience, loading, save, remove } = useExperience(id);
  const isEdit = id !== undefined;

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? 'Edit Experience' : 'Add Experience' }} />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : isEdit && !experience ? (
        <Screen>
          <EmptyState icon="alert-circle-outline" title="Entry not found" message="It may have been deleted." />
        </Screen>
      ) : (
        <ExperienceForm initial={experience} onSave={save} onDelete={isEdit ? remove : undefined} />
      )}
    </>
  );
}

type ExperienceFormProps = {
  initial: Experience | null;
  onSave: (input: ExperienceInput) => Promise<void>;
  /** Only given in edit mode; shows the Delete button. */
  onDelete?: () => Promise<void>;
};

function ExperienceForm({ initial, onSave, onDelete }: ExperienceFormProps) {
  const [values, setValues] = useState<ExperienceFormValues>(() =>
    initial ? toFormValues(initial) : EMPTY_FORM
  );
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const errors = validateExperience(values);
  const visibleErrors = submitted ? errors : {};

  /** Updates one field. The generic K keeps each field's own type (string, date, or type option). */
  const setField =
    <K extends keyof ExperienceFormValues>(field: K) =>
    (value: ExperienceFormValues[K]) =>
      setValues((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      Alert.alert('Check the form', 'Please fix the highlighted fields.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        title: values.title.trim(),
        organization: values.organization.trim(),
        type: values.type,
        location: emptyToNull(values.location),
        startDate: values.startDate,
        endDate: values.endDate,
        description: emptyToNull(values.description),
      });
      Alert.alert('Saved', 'Your experience has been saved.');
      router.back();
    } catch (e) {
      console.warn('[experience] save failed', e);
      Alert.alert('Could not save', 'Something went wrong while saving. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setConfirmVisible(false);
    if (!onDelete) return;
    try {
      await onDelete();
      router.back();
    } catch (e) {
      console.warn('[experience] delete failed', e);
      Alert.alert('Could not delete', 'Something went wrong while deleting. Please try again.');
    }
  };

  return (
    <Screen scroll>
      <Card>
        <TextField
          label="Title / position"
          required
          placeholder="Web Developer Intern"
          value={values.title}
          onChangeText={setField('title')}
          error={visibleErrors.title}
        />
        <TextField
          label="Company / organization"
          required
          placeholder="Accenture Philippines"
          value={values.organization}
          onChangeText={setField('organization')}
          error={visibleErrors.organization}
        />
        <Select
          label="Type"
          options={EXPERIENCE_TYPE_OPTIONS}
          value={values.type}
          onChange={setField('type')}
        />
        <TextField
          label="Location"
          placeholder="Taguig City"
          value={values.location}
          onChangeText={setField('location')}
        />
      </Card>

      <Card>
        <DateField
          label="Start date"
          value={values.startDate}
          onChange={setField('startDate')}
          clearable
        />
        <DateField
          label="End date"
          placeholder="Present (still ongoing)"
          value={values.endDate}
          onChange={setField('endDate')}
          error={visibleErrors.endDate}
          clearable
        />
        <Text style={styles.hint}>Leave the end date empty if you are still there.</Text>
      </Card>

      <Card>
        <TextField
          label="What did you do?"
          placeholder={'Built the company website using React\nFixed 30+ reported bugs'}
          value={values.description}
          onChangeText={setField('description')}
          multiline
        />
        <Text style={styles.hint}>Write one achievement per line — each line becomes a bullet on your resume.</Text>
      </Card>

      <Button title="Save experience" icon="checkmark" onPress={handleSave} loading={saving} />
      {onDelete ? (
        <Button title="Delete experience" icon="trash" variant="danger" onPress={() => setConfirmVisible(true)} />
      ) : null}

      <ConfirmDialog
        visible={confirmVisible}
        title="Delete this experience?"
        message="This cannot be undone."
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleDelete}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.mutedText,
  },
});
