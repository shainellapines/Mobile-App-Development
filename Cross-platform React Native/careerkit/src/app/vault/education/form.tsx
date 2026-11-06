import { AttachmentPicker } from '@/components/AttachmentPicker';
import { Card } from '@/components/Card';
import { DateField } from '@/components/DateField';
import { EntryFormShell } from '@/components/EntryFormShell';
import { FieldHint } from '@/components/FieldHint';
import { FormActions } from '@/components/FormActions';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useEntryForm } from '@/hooks/useEntryForm';
import { useEducation, useIdParam } from '@/hooks/useVaultEntries';
import type { Education, EducationInput } from '@/types/education';
import { emptyToNull, validateEducation, type EducationFormValues } from '@/utils/validators';

function toFormValues(e: Education | null): EducationFormValues {
  return {
    school: e?.school ?? '',
    degree: e?.degree ?? '',
    startDate: e?.startDate ?? null,
    endDate: e?.endDate ?? null,
    honors: e?.honors ?? '',
    description: e?.description ?? '',
  };
}

function toInput(v: EducationFormValues): EducationInput {
  return {
    school: v.school.trim(),
    degree: v.degree.trim(),
    startDate: v.startDate,
    endDate: v.endDate,
    honors: emptyToNull(v.honors),
    description: emptyToNull(v.description),
  };
}

/** Add / Edit Education. /vault/education/form = add, ?id=3 = edit. */
export default function EducationFormScreen() {
  const id = useIdParam();
  const { entry, loading, save, remove } = useEducation(id);
  const isEdit = id !== undefined;

  return (
    <EntryFormShell
      title={isEdit ? 'Edit Education' : 'Add Education'}
      loading={loading}
      notFound={isEdit && !entry}>
      <EducationForm initial={entry} ownerId={id} onSave={save} onDelete={isEdit ? remove : undefined} />
    </EntryFormShell>
  );
}

type FormProps = {
  initial: Education | null;
  /** The saved record's id (undefined while adding), used for attachments. */
  ownerId: number | undefined;
  onSave: (input: EducationInput) => Promise<void>;
  onDelete?: () => Promise<void>;
};

function EducationForm({ initial, ownerId, onSave, onDelete }: FormProps) {
  const { values, setField, errors, saving, handleSave, handleDelete } = useEntryForm({
    initialValues: toFormValues(initial),
    validate: validateEducation,
    toInput,
    onSave,
    onDelete,
    label: 'education',
  });

  return (
    <Screen scroll>
      <Card>
        <TextField
          label="School"
          required
          placeholder="Polytechnic University of the Philippines"
          value={values.school}
          onChangeText={setField('school')}
          error={errors.school}
        />
        <TextField
          label="Degree / program"
          required
          placeholder="BS Information Technology"
          value={values.degree}
          onChangeText={setField('degree')}
          error={errors.degree}
        />
        <TextField
          label="Honors / awards"
          placeholder="Cum Laude, Dean's Lister"
          value={values.honors}
          onChangeText={setField('honors')}
        />
      </Card>

      <Card>
        <DateField label="Start date" value={values.startDate} onChange={setField('startDate')} clearable />
        <DateField
          label="End date / graduation"
          placeholder="Present (still studying)"
          value={values.endDate}
          onChange={setField('endDate')}
          error={errors.endDate}
          clearable
        />
        <FieldHint>Leave the end date empty if you are still studying.</FieldHint>
      </Card>

      <Card>
        <TextField
          label="Details"
          placeholder={'Capstone: Offline career app for students\nRelevant courses: Mobile Dev, Databases'}
          value={values.description}
          onChangeText={setField('description')}
          multiline
        />
        <FieldHint>Optional. One item per line.</FieldHint>
      </Card>

      <AttachmentPicker ownerType="education" ownerId={ownerId} />

      <FormActions label="education" saving={saving} onSave={handleSave} onDelete={handleDelete} />
    </Screen>
  );
}
