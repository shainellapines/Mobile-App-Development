import { PickerField } from '@/components/PickerField';
import { dateToTime, formatTime, timeToDate } from '@/utils/ojtHours';

type TimeFieldProps = {
  label: string;
  /** Selected time as "HH:mm" (24-hour, e.g. "13:30"), the format saved in the database. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
};

/** Tappable time input that opens the phone's native clock. Shows "1:30 PM", saves "13:30". */
export function TimeField({ label, value, onChange, error, required = false }: TimeFieldProps) {
  return (
    <PickerField
      label={label}
      mode="time"
      icon="time-outline"
      displayText={formatTime(value)}
      initialValue={timeToDate(value)}
      onPick={(date) => onChange(dateToTime(date))}
      placeholder="Select a time"
      error={error}
      required={required}
    />
  );
}
