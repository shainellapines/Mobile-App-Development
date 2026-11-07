import { router } from 'expo-router';

import { EntryListScreen } from '@/components/EntryListScreen';
import { useOjtLogs } from '@/hooks/useOjt';
import { formatDate } from '@/utils/dates';
import { formatHours, formatTimeRange } from '@/utils/ojtHours';

/** All daily time records, newest first, searchable by tasks or date (FR-O2). */
export default function OjtLogsScreen() {
  const { items, loading } = useOjtLogs();

  return (
    <EntryListScreen
      items={items}
      loading={loading}
      describe={(log) => ({
        title: `${formatDate(log.logDate)} · ${formatHours(log.hours)}`,
        subtitle: `${formatTimeRange(log.timeIn, log.timeOut)} (${log.breakMinutes} min break)`,
        meta: log.tasks ?? undefined,
      })}
      searchFields={(log) => [log.tasks, formatDate(log.logDate)]}
      searchPlaceholder="Tasks or date, e.g. Nov"
      onAdd={() => router.push('/ojt/log-form')}
      onEdit={(log) => router.push({ pathname: '/ojt/log-form', params: { id: String(log.id) } })}
      addLabel="Log OJT Hours"
      empty={{
        icon: 'time-outline',
        title: 'No time records yet',
        message: 'Log your time in and time out each OJT day to track your rendered hours.',
      }}
    />
  );
}
