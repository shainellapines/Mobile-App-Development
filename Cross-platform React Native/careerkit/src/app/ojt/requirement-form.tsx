import { AttachmentPicker } from '@/components/AttachmentPicker';
import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { DateField } from '@/components/DateField';
import { EntryFormShell } from '@/components/EntryFormShell';
import { FormActions } from '@/components/FormActions';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useEntryForm } from '@/hooks/useEntryForm';
import { useOjtRequirement } from '@/hooks/useOjt';
import { useIdParam } from '@/hooks/useVaultEntries';
import type { OjtRequirement, OjtRequirementInput } from '@/types/ojt';
import { emptyToNull, validateOjtRequirement, type OjtRequirementFormValues } from '@/utils/validators';

function toFormValues(r: OjtRequirement | null): OjtRequirementFormValues {
  return {
    name: r?.name ?? '',
    isDone: r?.isDone ?? false,
    dueDate: r?.dueDate ?? null,
    notes: r?.notes ?? '',
  };
}

function toInput(v: OjtRequirementFormValues): OjtRequirementInput {
  return {
    name: v.name.trim(),
    isDone: v.isDone,
    dueDate: v.dueDate,
    notes: emptyToNull(v.notes),
  };
}

/** Add / Edit an OJT checklist item (FR-O4). /ojt/requirement-form = add, ?id=3 = edit. */
export default function OjtRequirementFormScreen() {
  const id = useIdParam();
  const { entry, loading, save, remove } = useOjtRequirement(id);
  const isEdit = id !== undefined;

  return (
    <EntryFormShell
      title={isEdit ? 'Edit OJT Requirement' : 'Add OJT Requirement'}
      loading={loading}
      notFound={isEdit && !entry}>
      <OjtRequirementForm initial={entry} ownerId={id} onSave={save} onDelete={isEdit ? remove : undefined} />
    </EntryFormShell>
  );
}

type FormProps = {
  initial: OjtRequirement | null;
  ownerId: number | undefined;
  onSave: (input: OjtRequirementInput) => Promise<unknown>;
  onDelete?: () => Promise<void>;
};

function OjtRequirementForm({ initial, ownerId, onSave, onDelete }: FormProps) {
  const { values, setField, errors, saving, handleSave, handleDelete } = useEntryForm({
    initialValues: toFormValues(initial),
    validate: validateOjtRequirement,
    toInput,
    onSave,
    onDelete,
    label: 'requirement',
  });

  return (
    <Screen scroll>
      <Card>
        <TextField
          label="Requirement"
          required
          placeholder="Memorandum of Agreement (MOA)"
          value={values.name}
          onChangeText={setField('name')}
          error={errors.name}
        />
        <Checkbox label="Done / submitted" checked={values.isDone} onChange={setField('isDone')} />
        <DateField label="Due date" value={values.dueDate} onChange={setField('dueDate')} clearable />
        <TextField
          label="Notes"
          placeholder="Who signs it, where to submit, copies needed…"
          value={values.notes}
          onChangeText={setField('notes')}
          multiline
        />
      </Card>

      <AttachmentPicker ownerType="ojt_requirement" ownerId={ownerId} />

      <FormActions label="requirement" saving={saving} onSave={handleSave} onDelete={handleDelete} />
    </Screen>
  );
}
