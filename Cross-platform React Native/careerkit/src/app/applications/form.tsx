import { router } from 'expo-router';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DateField } from '@/components/DateField';
import { EntryFormShell } from '@/components/EntryFormShell';
import { FieldHint } from '@/components/FieldHint';
import { FormActions } from '@/components/FormActions';
import { Screen } from '@/components/Screen';
import { Select, type SelectOption } from '@/components/Select';
import { TextField } from '@/components/TextField';
import { APPLICATION_CHANNEL_OPTIONS, APPLICATION_STATUS_OPTIONS } from '@/constants/applications';
import { useApplication } from '@/hooks/useApplications';
import { useEntryForm } from '@/hooks/useEntryForm';
import { useResumes } from '@/hooks/useResumes';
import { useIdParam } from '@/hooks/useVaultEntries';
import type { Application, ApplicationInput } from '@/types/application';
import type { Resume } from '@/types/resume';
import { toIsoDate } from '@/utils/dates';
import { emptyToNull, validateApplication, type ApplicationFormValues } from '@/utils/validators';

function toFormValues(a: Application | null): ApplicationFormValues {
  return {
    company: a?.company ?? '',
    position: a?.position ?? '',
    dateApplied: a?.dateApplied ?? toIsoDate(new Date()), // new applications default to today
    channel: a?.channel ?? 'none',
    status: a?.status ?? 'applied',
    resumeId: a?.resumeId ? String(a.resumeId) : 'none',
    salaryOffer: a?.salaryOffer ?? '',
    nextStepDate: a?.nextStepDate ?? null,
    notes: a?.notes ?? '',
  };
}

function toInput(v: ApplicationFormValues): ApplicationInput {
  return {
    company: v.company.trim(),
    position: v.position.trim(),
    dateApplied: v.dateApplied ?? toIsoDate(new Date()),
    channel: v.channel === 'none' ? null : v.channel,
    status: v.status,
    resumeId: v.resumeId === 'none' ? null : Number(v.resumeId),
    salaryOffer: emptyToNull(v.salaryOffer),
    nextStepDate: v.nextStepDate,
    notes: emptyToNull(v.notes),
  };
}

/** Add / Edit Application (FR-A1). /applications/form = add, ?id=3 = edit. */
export default function ApplicationFormScreen() {
  const id = useIdParam();
  const { entry, loading, save, remove } = useApplication(id);
  const resumes = useResumes();
  const isEdit = id !== undefined;

  return (
    <EntryFormShell
      title={isEdit ? 'Edit Application' : 'Add Application'}
      loading={loading || resumes.loading}
      notFound={isEdit && !entry}>
      <ApplicationForm
        initial={entry}
        resumes={resumes.items}
        onSave={save}
        onDelete={
          isEdit
            ? async () => {
                await remove();
                router.back(); // leave the detail screen too, since the application is gone
              }
            : undefined
        }
      />
    </EntryFormShell>
  );
}

type FormProps = {
  initial: Application | null;
  resumes: Resume[];
  onSave: (input: ApplicationInput) => Promise<unknown>;
  onDelete?: () => Promise<void>;
};

function ApplicationForm({ initial, resumes, onSave, onDelete }: FormProps) {
  const { values, setField, errors, saving, handleSave, handleDelete } = useEntryForm({
    initialValues: toFormValues(initial),
    validate: validateApplication,
    toInput,
    onSave,
    onDelete,
    label: 'application',
  });

  // One chip per saved resume version, plus "None".
  const resumeOptions: SelectOption<string>[] = [
    { value: 'none', label: 'None' },
    ...resumes.map((r) => ({ value: String(r.id), label: r.title })),
  ];

  return (
    <Screen scroll>
      <Card>
        <TextField
          label="Position"
          required
          placeholder="Junior Web Developer"
          value={values.position}
          onChangeText={setField('position')}
          error={errors.position}
        />
        <TextField
          label="Company"
          required
          placeholder="Accenture Philippines"
          value={values.company}
          onChangeText={setField('company')}
          error={errors.company}
        />
        <DateField
          label="Date applied"
          required
          value={values.dateApplied}
          onChange={setField('dateApplied')}
          error={errors.dateApplied}
        />
        <Select label="Where did you apply?" options={APPLICATION_CHANNEL_OPTIONS} value={values.channel} onChange={setField('channel')} />
      </Card>

      <Card>
        <Select label="Status" options={APPLICATION_STATUS_OPTIONS} value={values.status} onChange={setField('status')} />
        <DateField
          label="Next step date"
          placeholder="e.g. interview or exam date"
          value={values.nextStepDate}
          onChange={setField('nextStepDate')}
          error={errors.nextStepDate}
          clearable
        />
        <TextField
          label="Salary offer"
          placeholder="e.g. ₱25,000 / month"
          value={values.salaryOffer}
          onChangeText={setField('salaryOffer')}
        />
      </Card>

      <Card>
        <Select label="Resume sent" options={resumeOptions} value={values.resumeId} onChange={setField('resumeId')} />
        {resumes.length === 0 ? (
          <>
            <FieldHint>No saved resumes yet. Build one so you remember exactly what you sent.</FieldHint>
            <Button
              title="Open Resume Builder"
              icon="document-text-outline"
              variant="secondary"
              onPress={() => router.push('/resume/builder')}
            />
          </>
        ) : (
          <FieldHint>Pick the resume version you sent, so you can open it again before the interview.</FieldHint>
        )}
      </Card>

      <Card>
        <TextField
          label="Notes"
          placeholder="Recruiter name, interview questions, what to prepare…"
          value={values.notes}
          onChangeText={setField('notes')}
          multiline
        />
      </Card>

      <FormActions label="application" saving={saving} onSave={handleSave} onDelete={handleDelete} />
    </Screen>
  );
}
