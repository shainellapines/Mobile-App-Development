import { Card } from '@/components/Card';
import { DateField } from '@/components/DateField';
import { EntryFormShell } from '@/components/EntryFormShell';
import { FieldHint } from '@/components/FieldHint';
import { FormActions } from '@/components/FormActions';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { DEFAULT_REQUIRED_HOURS } from '@/constants/ojt';
import { useEntryForm } from '@/hooks/useEntryForm';
import { useOjtInfo } from '@/hooks/useOjt';
import type { OjtInfo, OjtInfoInput } from '@/types/ojt';
import { emptyToNull, validateOjtSetup, type OjtSetupFormValues } from '@/utils/validators';

function toFormValues(info: OjtInfo | null): OjtSetupFormValues {
  return {
    company: info?.company ?? '',
    supervisor: info?.supervisor ?? '',
    requiredHours: String(info?.requiredHours ?? DEFAULT_REQUIRED_HOURS),
    startDate: info?.startDate ?? null,
    targetEndDate: info?.targetEndDate ?? null,
  };
}

function toInput(v: OjtSetupFormValues): OjtInfoInput {
  return {
    company: emptyToNull(v.company),
    supervisor: emptyToNull(v.supervisor),
    requiredHours: Number(v.requiredHours.trim()),
    startDate: v.startDate,
    targetEndDate: v.targetEndDate,
  };
}

/** The "Saved" message mentions the checklist that was created on the first setup (FR-O4). */
function saveMessage(seeded: number): string {
  return seeded > 0
    ? `Your OJT is set up. We added ${seeded} common OJT requirements to your checklist — edit or delete any of them.`
    : 'Your OJT setup has been saved.';
}

/** OJT Setup (FR-O1): company, supervisor, required hours, dates. */
export default function OjtSetupScreen() {
  const { info, loading, save } = useOjtInfo();

  return (
    <EntryFormShell title={info ? 'Edit OJT Setup' : 'Set Up OJT'} loading={loading} notFound={false}>
      <OjtSetupForm initial={info} onSave={save} />
    </EntryFormShell>
  );
}

type FormProps = {
  initial: OjtInfo | null;
  onSave: (input: OjtInfoInput) => Promise<number>;
};

function OjtSetupForm({ initial, onSave }: FormProps) {
  const { values, setField, errors, saving, handleSave } = useEntryForm({
    initialValues: toFormValues(initial),
    validate: validateOjtSetup,
    toInput,
    onSave,
    label: 'OJT setup',
    successMessage: saveMessage,
  });

  return (
    <Screen scroll>
      <Card>
        <TextField
          label="Company / host training establishment"
          placeholder="Accenture Philippines"
          value={values.company}
          onChangeText={setField('company')}
        />
        <TextField
          label="Supervisor"
          placeholder="Ms. Maria Santos"
          value={values.supervisor}
          onChangeText={setField('supervisor')}
          autoCapitalize="words"
        />
      </Card>

      <Card>
        <TextField
          label="Required hours"
          required
          placeholder={String(DEFAULT_REQUIRED_HOURS)}
          value={values.requiredHours}
          onChangeText={setField('requiredHours')}
          error={errors.requiredHours}
          keyboardType="decimal-pad"
        />
        <FieldHint>{`Many programs require ${DEFAULT_REQUIRED_HOURS} hours. Check your school's OJT guidelines.`}</FieldHint>
        <DateField label="Start date" value={values.startDate} onChange={setField('startDate')} clearable />
        <DateField
          label="Target end date"
          value={values.targetEndDate}
          onChange={setField('targetEndDate')}
          error={errors.targetEndDate}
          clearable
        />
      </Card>

      <FormActions label="OJT setup" saving={saving} onSave={handleSave} />
    </Screen>
  );
}
