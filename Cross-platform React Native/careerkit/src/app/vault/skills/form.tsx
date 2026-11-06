import { Card } from '@/components/Card';
import { EntryFormShell } from '@/components/EntryFormShell';
import { FormActions } from '@/components/FormActions';
import { Screen } from '@/components/Screen';
import { Select } from '@/components/Select';
import { TextField } from '@/components/TextField';
import { SKILL_CATEGORY_OPTIONS, SKILL_LEVEL_OPTIONS } from '@/constants/vault';
import { useEntryForm } from '@/hooks/useEntryForm';
import { useIdParam, useSkill } from '@/hooks/useVaultEntries';
import type { Skill, SkillInput } from '@/types/skill';
import { validateSkill, type SkillFormValues } from '@/utils/validators';

function toFormValues(s: Skill | null): SkillFormValues {
  return {
    name: s?.name ?? '',
    category: s?.category ?? 'technical',
    level: s?.level ?? 'none',
  };
}

function toInput(v: SkillFormValues): SkillInput {
  return {
    name: v.name.trim(),
    category: v.category,
    level: v.level === 'none' ? null : v.level, // 'none' is a form-only choice; the DB stores NULL
  };
}

/** Add / Edit Skill. /vault/skills/form = add, ?id=3 = edit. */
export default function SkillFormScreen() {
  const id = useIdParam();
  const { entry, loading, save, remove } = useSkill(id);
  const isEdit = id !== undefined;

  return (
    <EntryFormShell title={isEdit ? 'Edit Skill' : 'Add Skill'} loading={loading} notFound={isEdit && !entry}>
      <SkillForm initial={entry} onSave={save} onDelete={isEdit ? remove : undefined} />
    </EntryFormShell>
  );
}

type FormProps = {
  initial: Skill | null;
  onSave: (input: SkillInput) => Promise<void>;
  onDelete?: () => Promise<void>;
};

function SkillForm({ initial, onSave, onDelete }: FormProps) {
  const { values, setField, errors, saving, handleSave, handleDelete } = useEntryForm({
    initialValues: toFormValues(initial),
    validate: validateSkill,
    toInput,
    onSave,
    onDelete,
    label: 'skill',
  });

  return (
    <Screen scroll>
      <Card>
        <TextField
          label="Skill"
          required
          placeholder="React Native"
          value={values.name}
          onChangeText={setField('name')}
          error={errors.name}
        />
        <Select
          label="Category"
          options={SKILL_CATEGORY_OPTIONS}
          value={values.category}
          onChange={setField('category')}
        />
        <Select label="Level" options={SKILL_LEVEL_OPTIONS} value={values.level} onChange={setField('level')} />
      </Card>

      <FormActions label="skill" saving={saving} onSave={handleSave} onDelete={handleDelete} />
    </Screen>
  );
}
