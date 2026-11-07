import { PickerField } from '@/components/PickerField';
import { formatDate, parseIsoDate, toIsoDate } from '@/utils/dates';

type DateFieldProps = {
  label: string;
  /** Selected date as "yyyy-MM-dd", or null when empty. */
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  /** Shows an "x" button to clear the date (e.g., end date empty = "Present"). */
  clearable?: boolean;
};

/**
 * Tappable date input that opens the phone's native calendar (see PickerField).
 * Screens only deal with "yyyy-MM-dd" strings; the Date objects stay inside this component.
 */
export function DateField({
  label,
  value,
  onChange,
  placeholder = 'Select a date',
  error,
  required = false,
  clearable = false,
}: DateFieldProps) {
  return (
    <PickerField
      label={label}
      mode="date"
      icon="calendar-outline"
      displayText={formatDate(value)}
      initialValue={parseIsoDate(value) ?? new Date()}
      onPick={(date) => onChange(toIsoDate(date))}
      onClear={clearable ? () => onChange(null) : undefined}
      placeholder={placeholder}
      error={error}
      required={required}
    />
  );
}
