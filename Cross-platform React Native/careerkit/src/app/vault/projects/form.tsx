import { AttachmentPicker } from '@/components/AttachmentPicker';
import { Card } from '@/components/Card';
import { DateField } from '@/components/DateField';
import { EntryFormShell } from '@/components/EntryFormShell';
import { FieldHint } from '@/components/FieldHint';
import { FormActions } from '@/components/FormActions';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useEntryForm } from '@/hooks/useEntryForm';
import { useIdParam, useProject } from '@/hooks/useVaultEntries';
import type { Project, ProjectInput } from '@/types/project';
import { emptyToNull, validateProject, type ProjectFormValues } from '@/utils/validators';

function toFormValues(p: Project | null): ProjectFormValues {
  return {
    name: p?.name ?? '',
    role: p?.role ?? '',
    techUsed: p?.techUsed ?? '',
    link: p?.link ?? '',
    startDate: p?.startDate ?? null,
    endDate: p?.endDate ?? null,
    description: p?.description ?? '',
  };
}

/** Tidies "React,  SQLite ,TypeScript" into "React, SQLite, TypeScript". */
function normalizeTechList(text: string): string | null {
  const items = text
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t !== '');
  return items.length > 0 ? items.join(', ') : null;
}

function toInput(v: ProjectFormValues): ProjectInput {
  return {
    name: v.name.trim(),
    role: emptyToNull(v.role),
    techUsed: normalizeTechList(v.techUsed),
    link: emptyToNull(v.link),
    startDate: v.startDate,
    endDate: v.endDate,
    description: emptyToNull(v.description),
  };
}

/** Add / Edit Project. /vault/projects/form = add, ?id=3 = edit. */
export default function ProjectFormScreen() {
  const id = useIdParam();
  const { entry, loading, save, remove } = useProject(id);
  const isEdit = id !== undefined;

  return (
    <EntryFormShell
      title={isEdit ? 'Edit Project' : 'Add Project'}
      loading={loading}
      notFound={isEdit && !entry}>
      <ProjectForm initial={entry} ownerId={id} onSave={save} onDelete={isEdit ? remove : undefined} />
    </EntryFormShell>
  );
}

type FormProps = {
  initial: Project | null;
  /** The saved record's id (undefined while adding), used for attachments. */
  ownerId: number | undefined;
  onSave: (input: ProjectInput) => Promise<void>;
  onDelete?: () => Promise<void>;
};

function ProjectForm({ initial, ownerId, onSave, onDelete }: FormProps) {
  const { values, setField, errors, saving, handleSave, handleDelete } = useEntryForm({
    initialValues: toFormValues(initial),
    validate: validateProject,
    toInput,
    onSave,
    onDelete,
    label: 'project',
  });

  return (
    <Screen scroll>
      <Card>
        <TextField
          label="Project name"
          required
          placeholder="CareerKit Mobile App"
          value={values.name}
          onChangeText={setField('name')}
          error={errors.name}
        />
        <TextField
          label="Your role"
          placeholder="Lead Developer"
          value={values.role}
          onChangeText={setField('role')}
        />
        <TextField
          label="Technologies used"
          placeholder="React Native, SQLite, TypeScript"
          value={values.techUsed}
          onChangeText={setField('techUsed')}
        />
        <FieldHint>Separate technologies with commas.</FieldHint>
        <TextField
          label="Link"
          placeholder="github.com/juan/careerkit"
          value={values.link}
          onChangeText={setField('link')}
          error={errors.link}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
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
      </Card>

      <Card>
        <TextField
          label="What did it do / what did you build?"
          placeholder={'Offline app that tracks job requirements\nDesigned the SQLite database'}
          value={values.description}
          onChangeText={setField('description')}
          multiline
        />
        <FieldHint>One point per line — each line becomes a bullet on your resume.</FieldHint>
      </Card>

      <AttachmentPicker ownerType="project" ownerId={ownerId} />

      <FormActions label="project" saving={saving} onSave={handleSave} onDelete={handleDelete} />
    </Screen>
  );
}
