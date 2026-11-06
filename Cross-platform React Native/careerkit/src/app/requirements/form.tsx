import { StyleSheet, Text, View } from 'react-native';

import { AttachmentPicker } from '@/components/AttachmentPicker';
import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { DateField } from '@/components/DateField';
import { EntryFormShell } from '@/components/EntryFormShell';
import { FieldHint } from '@/components/FieldHint';
import { FormActions } from '@/components/FormActions';
import { Screen } from '@/components/Screen';
import { Select } from '@/components/Select';
import { StatusBadge } from '@/components/StatusBadge';
import { TextField } from '@/components/TextField';
import {
  DEFAULT_REMINDER_DAYS,
  REQUIREMENT_CATEGORY_OPTIONS,
  REQUIREMENT_STATUS_INFO,
} from '@/constants/requirements';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { VALIDITY_DISCLAIMER } from '@/constants/requirementTemplates';
import { useEntryForm } from '@/hooks/useEntryForm';
import { useIdParam, useRequirement } from '@/hooks/useVaultEntries';
import type { Requirement, RequirementInput } from '@/types/requirement';
import { expiryCountdown, getRequirementStatus } from '@/utils/requirementStatus';
import { findTemplate, validityLabel, valuesForNewIssueDate } from '@/utils/requirementTemplates';
import { emptyToNull, validateRequirement, type RequirementFormValues } from '@/utils/validators';

function toFormValues(r: Requirement | null): RequirementFormValues {
  return {
    name: r?.name ?? '',
    category: r?.category ?? 'private',
    referenceNo: r?.referenceNo ?? '',
    issueDate: r?.issueDate ?? null,
    expiryDate: r?.expiryDate ?? null,
    notYetObtained: r?.statusOverride === 'not_yet_obtained',
    reminderDays: String(r?.reminderDaysBefore ?? DEFAULT_REMINDER_DAYS),
    notes: r?.notes ?? '',
  };
}

function toInput(v: RequirementFormValues): RequirementInput {
  return {
    name: v.name.trim(),
    category: v.category,
    referenceNo: emptyToNull(v.referenceNo),
    issueDate: v.issueDate,
    expiryDate: v.expiryDate,
    statusOverride: v.notYetObtained ? 'not_yet_obtained' : null,
    notes: emptyToNull(v.notes),
    reminderDaysBefore: Number(v.reminderDays.trim()),
  };
}

/** Add / Edit Requirement (FR-Q1). /requirements/form = add, ?id=3 = edit. */
export default function RequirementFormScreen() {
  const id = useIdParam();
  const { entry, loading, save, remove } = useRequirement(id);
  const isEdit = id !== undefined;

  return (
    <EntryFormShell
      title={isEdit ? 'Edit Requirement' : 'Add Requirement'}
      loading={loading}
      notFound={isEdit && !entry}>
      <RequirementForm initial={entry} ownerId={id} onSave={save} onDelete={isEdit ? remove : undefined} />
    </EntryFormShell>
  );
}

type FormProps = {
  initial: Requirement | null;
  ownerId: number | undefined;
  onSave: (input: RequirementInput) => Promise<unknown>;
  onDelete?: () => Promise<void>;
};

function RequirementForm({ initial, ownerId, onSave, onDelete }: FormProps) {
  const { values, setField, patchValues, errors, saving, handleSave, handleDelete } = useEntryForm({
    initialValues: toFormValues(initial),
    validate: validateRequirement,
    toInput,
    onSave,
    onDelete,
    label: 'requirement',
  });

  // New issue date → maybe pre-fill the expiry and untick "not yet obtained" (FR-Q4).
  const handleIssueDate = (issueDate: string | null) =>
    patchValues((prev) => valuesForNewIssueDate(prev, issueDate));

  const templateMonths = findTemplate(values.name)?.defaultValidityMonths ?? null;

  // Live status preview: updates as the user changes dates, using the same rules as the list.
  const preview = toInput(values);
  const status = getRequirementStatus(preview);
  const info = REQUIREMENT_STATUS_INFO[status];
  const countdown = expiryCountdown(preview);

  return (
    <Screen scroll>
      <Card>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status</Text>
          <StatusBadge label={info.label} color={info.color} />
        </View>
        {countdown ? <FieldHint>{countdown}</FieldHint> : null}
      </Card>

      <Card>
        <TextField
          label="Document name"
          required
          placeholder="NBI Clearance"
          value={values.name}
          onChangeText={setField('name')}
          error={errors.name}
        />
        <Select
          label="Category"
          options={REQUIREMENT_CATEGORY_OPTIONS}
          value={values.category}
          onChange={setField('category')}
        />
        <TextField
          label="Reference no."
          placeholder="e.g. NBI ID or OR number"
          value={values.referenceNo}
          onChangeText={setField('referenceNo')}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </Card>

      <Card>
        <Checkbox
          label="I don't have this document yet"
          description="Unticks itself when you enter an issue date"
          checked={values.notYetObtained}
          onChange={setField('notYetObtained')}
        />
        <DateField label="Issue date" value={values.issueDate} onChange={handleIssueDate} clearable />
        <DateField
          label="Expiry date"
          placeholder="Does not expire"
          value={values.expiryDate}
          onChange={setField('expiryDate')}
          error={errors.expiryDate}
          clearable
        />
        <FieldHint>
          {templateMonths
            ? `Expiry is suggested as ${validityLabel(templateMonths)} after the issue date. ${VALIDITY_DISCLAIMER}`
            : 'Validity rules differ by issuing office and employer. Always check the date printed on your document.'}
        </FieldHint>
      </Card>

      <Card>
        <TextField
          label="Remind me (days before expiry)"
          placeholder={String(DEFAULT_REMINDER_DAYS)}
          value={values.reminderDays}
          onChangeText={setField('reminderDays')}
          error={errors.reminderDays}
          keyboardType="number-pad"
        />
        <FieldHint>Reminders arrive at 9:00 AM. (Notifications are switched on in a later update.)</FieldHint>
        <TextField
          label="Notes"
          placeholder="Where to get it, fees, requirements to bring…"
          value={values.notes}
          onChangeText={setField('notes')}
          multiline
        />
      </Card>

      <AttachmentPicker ownerType="requirement" ownerId={ownerId} />

      <FormActions label="requirement" saving={saving} onSave={handleSave} onDelete={handleDelete} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  statusLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
});
