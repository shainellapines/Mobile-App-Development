import { Card } from '@/components/Card';
import { DateField } from '@/components/DateField';
import { EntryFormShell } from '@/components/EntryFormShell';
import { FieldHint } from '@/components/FieldHint';
import { FormActions } from '@/components/FormActions';
import { Screen } from '@/components/Screen';
import { Select } from '@/components/Select';
import { TextField } from '@/components/TextField';
import { EXPERIENCE_TYPE_OPTIONS } from '@/constants/vault';
import { useEntryForm } from '@/hooks/useEntryForm';
import { useExperience, useIdParam } from '@/hooks/useVaultEntries';
import type { Experience, ExperienceInput } from '@/types/experience';
import { emptyToNull, validateExperience, type ExperienceFormValues } from '@/utils/validators';

function toFormValues(e: Experience | null): ExperienceFormValues {
  return {
    title: e?.title ?? '',
    organization: e?.organization ?? '',
    type: e?.type ?? 'job',
    location: e?.location ?? '',
    startDate: e?.startDate ?? null,
    endDate: e?.endDate ?? null,
    description: e?.description ?? '',
  };
}

function toInput(v: ExperienceFormValues): ExperienceInput {
  return {
    title: v.title.trim(),
    organization: v.organization.trim(),
    type: v.type,
    location: emptyToNull(v.location),
    startDate: v.startDate,
    endDate: v.endDate,
    description: emptyToNull(v.description),
  };
}

/** Add / Edit Experience. /vault/experience/form = add, /vault/experience/form?id=3 = edit. */
export default function ExperienceFormScreen() {
  const id = useIdParam();
  const { entry, loading, save, remove } = useExperience(id);
  const isEdit = id !== undefined;

  return (
    <EntryFormShell
      title={isEdit ? 'Edit Experience' : 'Add Experience'}
      loading={loading}
      notFound={isEdit && !entry}>
      <ExperienceForm initial={entry} onSave={save} onDelete={isEdit ? remove : undefined} />
    </EntryFormShell>
  );
}

type FormProps = {
  initial: Experience | null;
  onSave: (input: ExperienceInput) => Promise<void>;
  onDelete?: () => Promise<void>;
};

function ExperienceForm({ initial, onSave, onDelete }: FormProps) {
  const { values, setField, errors, saving, handleSave, handleDelete } = useEntryForm({
    initialValues: toFormValues(initial),
    validate: validateExperience,
    toInput,
    onSave,
    onDelete,
    label: 'experience',
  });

  return (
    <Screen scroll>
      <Card>
        <TextField
          label="Title / position"
          required
          placeholder="Web Developer Intern"
          value={values.title}
          onChangeText={setField('title')}
          error={errors.title}
        />
        <TextField
          label="Company / organization"
          required
          placeholder="Accenture Philippines"
          value={values.organization}
          onChangeText={setField('organization')}
          error={errors.organization}
        />
        <Select label="Type" options={EXPERIENCE_TYPE_OPTIONS} value={values.type} onChange={setField('type')} />
        <TextField
          label="Location"
          placeholder="Taguig City"
          value={values.location}
          onChangeText={setField('location')}
        />
      </Card>

      <Card>
        <DateField label="Start date" value={values.startDate} onChange={setField('startDate')} clearable />
        <DateField
          label="End date"
          placeholder="Present (still ongoing)"
          value={values.endDate}
          onChange={setField('endDate')}
          error={errors.endDate}
          clearable
        />
        <FieldHint>Leave the end date empty if you are still there.</FieldHint>
      </Card>

      <Card>
        <TextField
          label="What did you do?"
          placeholder={'Built the company website using React\nFixed 30+ reported bugs'}
          value={values.description}
          onChangeText={setField('description')}
          multiline
        />
        <FieldHint>Write one achievement per line — each line becomes a bullet on your resume.</FieldHint>
      </Card>

      <FormActions label="experience" saving={saving} onSave={handleSave} onDelete={handleDelete} />
    </Screen>
  );
}
