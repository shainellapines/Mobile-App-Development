import { AttachmentPicker } from '@/components/AttachmentPicker';
import { Card } from '@/components/Card';
import { DateField } from '@/components/DateField';
import { EntryFormShell } from '@/components/EntryFormShell';
import { FieldHint } from '@/components/FieldHint';
import { FormActions } from '@/components/FormActions';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useEntryForm } from '@/hooks/useEntryForm';
import { useCertification, useIdParam } from '@/hooks/useVaultEntries';
import type { Certification, CertificationInput } from '@/types/certification';
import { emptyToNull, validateCertification, type CertificationFormValues } from '@/utils/validators';

function toFormValues(c: Certification | null): CertificationFormValues {
  return {
    name: c?.name ?? '',
    issuer: c?.issuer ?? '',
    issueDate: c?.issueDate ?? null,
    expiryDate: c?.expiryDate ?? null,
    credentialId: c?.credentialId ?? '',
  };
}

function toInput(v: CertificationFormValues): CertificationInput {
  return {
    name: v.name.trim(),
    issuer: emptyToNull(v.issuer),
    issueDate: v.issueDate,
    expiryDate: v.expiryDate,
    credentialId: emptyToNull(v.credentialId),
  };
}

/** Add / Edit Certification. /vault/certifications/form = add, ?id=3 = edit. */
export default function CertificationFormScreen() {
  const id = useIdParam();
  const { entry, loading, save, remove } = useCertification(id);
  const isEdit = id !== undefined;

  return (
    <EntryFormShell
      title={isEdit ? 'Edit Certification' : 'Add Certification'}
      loading={loading}
      notFound={isEdit && !entry}>
      <CertificationForm initial={entry} ownerId={id} onSave={save} onDelete={isEdit ? remove : undefined} />
    </EntryFormShell>
  );
}

type FormProps = {
  initial: Certification | null;
  /** The saved record's id (undefined while adding), used for attachments. */
  ownerId: number | undefined;
  onSave: (input: CertificationInput) => Promise<void>;
  onDelete?: () => Promise<void>;
};

function CertificationForm({ initial, ownerId, onSave, onDelete }: FormProps) {
  const { values, setField, errors, saving, handleSave, handleDelete } = useEntryForm({
    initialValues: toFormValues(initial),
    validate: validateCertification,
    toInput,
    onSave,
    onDelete,
    label: 'certification',
  });

  return (
    <Screen scroll>
      <Card>
        <TextField
          label="Certification name"
          required
          placeholder="Computer Systems Servicing NC II"
          value={values.name}
          onChangeText={setField('name')}
          error={errors.name}
        />
        <TextField
          label="Issuing organization"
          placeholder="TESDA"
          value={values.issuer}
          onChangeText={setField('issuer')}
        />
        <TextField
          label="Credential ID"
          placeholder="e.g. 21130102001234"
          value={values.credentialId}
          onChangeText={setField('credentialId')}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </Card>

      <Card>
        <DateField label="Issue date" value={values.issueDate} onChange={setField('issueDate')} clearable />
        <DateField
          label="Expiry date"
          placeholder="Does not expire"
          value={values.expiryDate}
          onChange={setField('expiryDate')}
          error={errors.expiryDate}
          clearable
        />
        <FieldHint>Leave the expiry date empty if it does not expire.</FieldHint>
      </Card>

      <AttachmentPicker ownerType="certification" ownerId={ownerId} />

      <FormActions label="certification" saving={saving} onSave={handleSave} onDelete={handleDelete} />
    </Screen>
  );
}
