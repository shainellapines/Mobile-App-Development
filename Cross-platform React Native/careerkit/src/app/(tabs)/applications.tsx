import { router } from 'expo-router';
import { useState } from 'react';

import { EntryListScreen } from '@/components/EntryListScreen';
import { FilterChips, type FilterOption } from '@/components/FilterChips';
import { StatusBadge } from '@/components/StatusBadge';
import { APPLICATION_STATUS_INFO, APPLICATION_STATUS_ORDER } from '@/constants/applications';
import { useApplications } from '@/hooks/useApplications';
import type { ApplicationStatus } from '@/types/application';
import { formatDate } from '@/utils/dates';

type StatusFilter = ApplicationStatus | 'all';

/** Application Tracker (FR-A1, A3): newest first, status filter with counts, search. */
export default function ApplicationsScreen() {
  const { items, loading } = useApplications();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const statusOptions: FilterOption<StatusFilter>[] = [
    { value: 'all', label: `All (${items.length})` },
    ...APPLICATION_STATUS_ORDER.map((status) => ({
      value: status,
      label: `${APPLICATION_STATUS_INFO[status].label} (${items.filter((a) => a.status === status).length})`,
    })),
  ];

  return (
    <EntryListScreen
      inTab
      items={items}
      loading={loading}
      filter={(a) => statusFilter === 'all' || a.status === statusFilter}
      filters={
        <FilterChips
          accessibilityLabel="Filter by status"
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      }
      badge={(a) => {
        const info = APPLICATION_STATUS_INFO[a.status];
        return <StatusBadge label={info.label} color={info.color} />;
      }}
      describe={(a) => ({
        title: a.position,
        subtitle: [a.company, a.channel].filter(Boolean).join(' · '),
        meta: [
          `Applied ${formatDate(a.dateApplied)}`,
          a.nextStepDate ? `Next step ${formatDate(a.nextStepDate)}` : '',
        ]
          .filter(Boolean)
          .join(' · '),
      })}
      searchFields={(a) => [a.company, a.position]}
      searchPlaceholder="Company or position"
      onAdd={() => router.push('/applications/form')}
      onEdit={(a) => router.push({ pathname: '/applications/[id]', params: { id: String(a.id) } })}
      addLabel="Add Application"
      empty={{
        icon: 'paper-plane-outline',
        title: 'No applications yet',
        message: 'Log every job you apply to, which resume you sent, and how it is going.',
      }}
    />
  );
}
