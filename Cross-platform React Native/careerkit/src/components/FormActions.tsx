import { useState } from 'react';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';

type FormActionsProps = {
  /** e.g. "education" → "Save education", "Delete education". */
  label: string;
  saving: boolean;
  onSave: () => void;
  /** Only in edit mode; shows the Delete button, which asks for confirmation first. */
  onDelete?: () => void;
};

/** The Save and Delete buttons at the bottom of every vault form. */
export function FormActions({ label, saving, onSave, onDelete }: FormActionsProps) {
  const [confirmVisible, setConfirmVisible] = useState(false);

  return (
    <>
      <Button title={`Save ${label}`} icon="checkmark" onPress={onSave} loading={saving} />
      {onDelete ? (
        <>
          <Button
            title={`Delete ${label}`}
            icon="trash"
            variant="danger"
            onPress={() => setConfirmVisible(true)}
          />
          <ConfirmDialog
            visible={confirmVisible}
            title={`Delete this ${label}?`}
            message="This cannot be undone."
            confirmLabel="Delete"
            destructive
            onCancel={() => setConfirmVisible(false)}
            onConfirm={() => {
              setConfirmVisible(false);
              onDelete();
            }}
          />
        </>
      ) : null}
    </>
  );
}
