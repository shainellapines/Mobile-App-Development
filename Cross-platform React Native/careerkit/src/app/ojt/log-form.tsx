import Ionicons from '@expo/vector-icons/Ionicons';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { DateField } from '@/components/DateField';
import { EntryFormShell } from '@/components/EntryFormShell';
import { FormActions } from '@/components/FormActions';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { TimeField } from '@/components/TimeField';
import { DEFAULT_BREAK_MINUTES, DEFAULT_TIME_IN, DEFAULT_TIME_OUT } from '@/constants/ojt';
import { Colors, FontSize, FontWeight, Spacing, StatusColors } from '@/constants/theme';
import { useEntryForm } from '@/hooks/useEntryForm';
import { useOjtLog, useOjtLogs } from '@/hooks/useOjt';
import { useIdParam } from '@/hooks/useVaultEntries';
import type { OjtLog, OjtLogInput } from '@/types/ojt';
import { formatDate, toIsoDate } from '@/utils/dates';
import { computeLogHours, formatHours } from '@/utils/ojtHours';
import { emptyToNull, validateOjtLog, type OjtLogFormValues } from '@/utils/validators';

function toFormValues(log: OjtLog | null): OjtLogFormValues {
  return {
    logDate: log?.logDate ?? toIsoDate(new Date()), // new logs default to today
    timeIn: log?.timeIn ?? DEFAULT_TIME_IN,
    timeOut: log?.timeOut ?? DEFAULT_TIME_OUT,
    breakMinutes: String(log?.breakMinutes ?? DEFAULT_BREAK_MINUTES),
    tasks: log?.tasks ?? '',
  };
}

function toInput(v: OjtLogFormValues): OjtLogInput {
  return {
    logDate: v.logDate ?? toIsoDate(new Date()),
    timeIn: v.timeIn,
    timeOut: v.timeOut,
    breakMinutes: Number(v.breakMinutes.trim()),
    tasks: emptyToNull(v.tasks),
  };
}

/** Add / Edit a daily time record (FR-O2). /ojt/log-form = add, ?id=3 = edit. */
export default function OjtLogFormScreen() {
  const id = useIdParam();
  const { entry, loading, save, remove } = useOjtLog(id);
  const logs = useOjtLogs(); // used to warn about a second log on the same date
  const isEdit = id !== undefined;

  // Dates that already have a log (not counting the one being edited).
  const takenDates = new Set(logs.items.filter((l) => l.id !== id).map((l) => l.logDate));

  return (
    <EntryFormShell
      title={isEdit ? 'Edit Time Record' : 'Log OJT Hours'}
      loading={loading || logs.loading}
      notFound={isEdit && !entry}>
      <OjtLogForm initial={entry} takenDates={takenDates} onSave={save} onDelete={isEdit ? remove : undefined} />
    </EntryFormShell>
  );
}

type FormProps = {
  initial: OjtLog | null;
  takenDates: Set<string>;
  onSave: (input: OjtLogInput) => Promise<unknown>;
  onDelete?: () => Promise<void>;
};

function OjtLogForm({ initial, takenDates, onSave, onDelete }: FormProps) {
  const { values, setField, errors, saving, handleSave, handleDelete } = useEntryForm({
    initialValues: toFormValues(initial),
    validate: validateOjtLog,
    toInput,
    onSave,
    onDelete,
    label: 'time record',
  });

  // Live preview of the hours, using the same formula the repository saves.
  const hours = computeLogHours(values.timeIn, values.timeOut, Number(values.breakMinutes.trim()));
  const isDuplicate = values.logDate !== null && takenDates.has(values.logDate);

  /** FR-O2: a second log on the same date is allowed (e.g. split shifts), but only after a warning. */
  const handleSavePress = () => {
    if (!isDuplicate) {
      handleSave();
      return;
    }
    Alert.alert(
      'Date already logged',
      `You already have a time record for ${formatDate(values.logDate)}. Save another one for the same day?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save anyway', onPress: handleSave },
      ]
    );
  };

  return (
    <Screen scroll>
      <Card>
        <Text style={styles.hoursLabel}>Hours for this day</Text>
        <Text style={styles.hoursValue}>{hours === null ? '—' : formatHours(hours)}</Text>
        <Text style={styles.formula}>Time out − time in − break</Text>
      </Card>

      <Card>
        <DateField
          label="Date"
          required
          value={values.logDate}
          onChange={setField('logDate')}
          error={errors.logDate}
        />
        {isDuplicate ? (
          <View style={styles.warning} accessibilityRole="alert">
            <Ionicons name="warning-outline" size={FontSize.md} color={StatusColors.expiring_soon} />
            <Text style={styles.warningText}>You already logged hours on this date.</Text>
          </View>
        ) : null}
        <View style={styles.row}>
          <View style={styles.flex}>
            <TimeField
              label="Time in"
              required
              value={values.timeIn}
              onChange={setField('timeIn')}
              error={errors.timeIn}
            />
          </View>
          <View style={styles.flex}>
            <TimeField
              label="Time out"
              required
              value={values.timeOut}
              onChange={setField('timeOut')}
              error={errors.timeOut}
            />
          </View>
        </View>
        <TextField
          label="Break (minutes)"
          placeholder={String(DEFAULT_BREAK_MINUTES)}
          value={values.breakMinutes}
          onChangeText={setField('breakMinutes')}
          error={errors.breakMinutes}
          keyboardType="number-pad"
        />
      </Card>

      <Card>
        <TextField
          label="Tasks done"
          placeholder="What did you work on today?"
          value={values.tasks}
          onChangeText={setField('tasks')}
          multiline
        />
      </Card>

      <FormActions label="time record" saving={saving} onSave={handleSavePress} onDelete={handleDelete} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hoursLabel: {
    fontSize: FontSize.sm,
    color: Colors.mutedText,
  },
  hoursValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  formula: {
    fontSize: FontSize.xs,
    color: Colors.mutedText,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  warningText: {
    flex: 1,
    fontSize: FontSize.xs,
    color: Colors.text,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  flex: {
    flex: 1,
  },
});
