import { router } from 'expo-router';

import { EntryListScreen } from '@/components/EntryListScreen';
import { useEducationList } from '@/hooks/useVaultEntries';
import { formatDateRange } from '@/utils/dates';

/** Education list: newest first, search, tap to edit, + to add. */
export default function EducationListScreen() {
  const { items, loading } = useEducationList();

  return (
    <EntryListScreen
      items={items}
      loading={loading}
      describe={(e) => ({
        title: e.degree,
        subtitle: e.honors ? `${e.school} · ${e.honors}` : e.school,
        meta: formatDateRange(e.startDate, e.endDate),
      })}
      searchFields={(e) => [e.school, e.degree, e.honors]}
      searchPlaceholder="School, degree, or honors"
      onAdd={() => router.push('/vault/education/form')}
      onEdit={(e) => router.push({ pathname: '/vault/education/form', params: { id: String(e.id) } })}
      addLabel="Add Education"
      empty={{
        icon: 'school-outline',
        title: 'No education yet',
        message: 'Add your college degree, senior high strand, or other schooling.',
      }}
    />
  );
}
