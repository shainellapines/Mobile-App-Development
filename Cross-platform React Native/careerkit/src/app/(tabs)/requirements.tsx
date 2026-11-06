import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { EntryListScreen } from '@/components/EntryListScreen';
import { FilterChips, type FilterOption } from '@/components/FilterChips';
import { StatusBadge } from '@/components/StatusBadge';
import {
  REQUIREMENT_CATEGORY_OPTIONS,
  REQUIREMENT_STATUS_INFO,
  REQUIREMENT_STATUS_ORDER,
  requirementCategoryLabel,
} from '@/constants/requirements';
import { Spacing } from '@/constants/theme';
import { useRequirements } from '@/hooks/useVaultEntries';
import type { RequirementCategory, RequirementStatus } from '@/types/requirement';
import { formatDate } from '@/utils/dates';
import { expiryCountdown, getRequirementStatus, sortByUrgency } from '@/utils/requirementStatus';

type StatusFilter = RequirementStatus | 'all';
type CategoryFilter = RequirementCategory | 'all';

/**
 * Requirements Tracker (FR-Q1, Q3, Q6): pre-employment documents, most urgent first,
 * with a colored status badge and filters by status and category.
 */
export default function RequirementsScreen() {
  const { items, loading } = useRequirements();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const sorted = sortByUrgency(items);

  // Chip labels include counts, e.g. "Expired (2)", so problems are visible at a glance.
  const countOf = (status: RequirementStatus) => items.filter((r) => getRequirementStatus(r) === status).length;
  const statusOptions: FilterOption<StatusFilter>[] = [
    { value: 'all', label: `All (${items.length})` },
    ...REQUIREMENT_STATUS_ORDER.map((status) => ({
      value: status,
      label: `${REQUIREMENT_STATUS_INFO[status].label} (${countOf(status)})`,
    })),
  ];
  const categoryOptions: FilterOption<CategoryFilter>[] = [
    { value: 'all', label: 'All categories' },
    ...REQUIREMENT_CATEGORY_OPTIONS,
  ];

  return (
    <EntryListScreen
      inTab
      items={sorted}
      loading={loading}
      filter={(r) =>
        (statusFilter === 'all' || getRequirementStatus(r) === statusFilter) &&
        (categoryFilter === 'all' || r.category === categoryFilter)
      }
      filters={
        <View style={styles.filters}>
          <FilterChips
            accessibilityLabel="Filter by status"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <FilterChips
            accessibilityLabel="Filter by category"
            options={categoryOptions}
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
        </View>
      }
      badge={(r) => {
        const info = REQUIREMENT_STATUS_INFO[getRequirementStatus(r)];
        return <StatusBadge label={info.label} color={info.color} />;
      }}
      describe={(r) => ({
        title: r.name,
        subtitle: [requirementCategoryLabel(r.category), r.referenceNo].filter(Boolean).join(' · '),
        meta: [expiryCountdown(r), r.expiryDate ? `(${formatDate(r.expiryDate)})` : '']
          .filter(Boolean)
          .join(' '),
      })}
      searchFields={(r) => [r.name, r.referenceNo, r.notes]}
      searchPlaceholder="Document name or reference no."
      onAdd={() => router.push('/requirements/form')}
      onEdit={(r) => router.push({ pathname: '/requirements/form', params: { id: String(r.id) } })}
      addLabel="Add Requirement"
      empty={{
        icon: 'document-text-outline',
        title: 'No requirements yet',
        message: 'Track your NBI, Police, and Barangay clearances, medical certificate, and more — with expiry reminders.',
      }}
    />
  );
}

const styles = StyleSheet.create({
  filters: {
    gap: Spacing.sm,
  },
});
