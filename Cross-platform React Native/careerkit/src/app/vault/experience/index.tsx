import { router } from 'expo-router';

import { VaultListScreen } from '@/components/VaultListScreen';
import { experienceTypeLabel } from '@/constants/vault';
import { useExperiences } from '@/hooks/useVaultEntries';
import { formatDateRange } from '@/utils/dates';

/** Experience list: newest first, search, tap to edit, + to add. */
export default function ExperienceListScreen() {
  const { items, loading } = useExperiences();

  return (
    <VaultListScreen
      items={items}
      loading={loading}
      describe={(e) => ({
        title: e.title,
        subtitle: `${e.organization} · ${experienceTypeLabel(e.type)}`,
        meta: formatDateRange(e.startDate, e.endDate),
      })}
      searchFields={(e) => [e.title, e.organization, e.location]}
      searchPlaceholder="Title, company, or location"
      onAdd={() => router.push('/vault/experience/form')}
      onEdit={(e) => router.push({ pathname: '/vault/experience/form', params: { id: String(e.id) } })}
      addLabel="Add Experience"
      empty={{
        icon: 'briefcase-outline',
        title: 'No experiences yet',
        message: 'Add your OJT, jobs, volunteer work, and organization roles.',
      }}
    />
  );
}
