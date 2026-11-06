import { router } from 'expo-router';

import { EntryListScreen } from '@/components/EntryListScreen';
import { useProjects } from '@/hooks/useVaultEntries';
import { formatDateRange } from '@/utils/dates';

/** Projects list: newest first, search, tap to edit, + to add. */
export default function ProjectListScreen() {
  const { items, loading } = useProjects();

  return (
    <EntryListScreen
      items={items}
      loading={loading}
      describe={(p) => ({
        title: p.name,
        subtitle: [p.role, p.techUsed].filter(Boolean).join(' · ') || undefined,
        meta: formatDateRange(p.startDate, p.endDate),
      })}
      searchFields={(p) => [p.name, p.role, p.techUsed]}
      searchPlaceholder="Name, role, or technology"
      onAdd={() => router.push('/vault/projects/form')}
      onEdit={(p) => router.push({ pathname: '/vault/projects/form', params: { id: String(p.id) } })}
      addLabel="Add Project"
      empty={{
        icon: 'code-slash-outline',
        title: 'No projects yet',
        message: 'Add your capstone, school projects, or personal apps.',
      }}
    />
  );
}
