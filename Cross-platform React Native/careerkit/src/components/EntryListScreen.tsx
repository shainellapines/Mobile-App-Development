import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import type { Edge } from 'react-native-safe-area-context';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { FAB } from '@/components/FAB';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

/** The up-to-three lines of text shown on each card. */
export type EntrySummary = {
  title: string;
  subtitle?: string;
  meta?: string;
};

type EntryListScreenProps<T extends { id: number }> = {
  items: T[];
  loading: boolean;
  /** Turns one record into the text shown on its card. */
  describe: (item: T) => EntrySummary;
  /** The fields the search box looks in. */
  searchFields: (item: T) => (string | null)[];
  searchPlaceholder: string;
  onAdd: () => void;
  onEdit: (item: T) => void;
  /** e.g. "Add Education" — used for the empty state button and the FAB. */
  addLabel: string;
  empty: { icon: ComponentProps<typeof Ionicons>['name']; title: string; message: string };
  /** Optional: extra controls under the search box (e.g. filter chips). */
  filters?: ReactNode;
  /** Optional: hides items that do not match the screen's filters. */
  filter?: (item: T) => boolean;
  /** Optional: something shown at the top-right of each card (e.g. a status badge). */
  badge?: (item: T) => ReactNode;
  /** Set when the screen is a bottom tab: the tab bar already handles the bottom safe area. */
  inTab?: boolean;
};

/**
 * Shared list screen (vault categories, resumes, requirements, ...) (FR-V1, V4, V5):
 * loading spinner → empty state with "Add" button → searchable list of cards + FAB.
 * Each screen only decides WHAT to show (describe, searchFields, filters, badge); this decides HOW.
 */
export function EntryListScreen<T extends { id: number }>({
  items,
  loading,
  describe,
  searchFields,
  searchPlaceholder,
  onAdd,
  onEdit,
  addLabel,
  empty,
  filters,
  filter,
  badge,
  inTab = false,
}: EntryListScreenProps<T>) {
  // Inside a tab, skip the bottom safe area (the tab bar covers it). Otherwise use Screen's default.
  const edges: Edge[] | undefined = inTab ? ['left', 'right'] : undefined;
  const [search, setSearch] = useState('');

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <Screen edges={edges}>
        <EmptyState
          icon={empty.icon}
          title={empty.title}
          message={empty.message}
          actionLabel={addLabel}
          onAction={onAdd}
        />
      </Screen>
    );
  }

  // Screen filters first, then a case-insensitive search across the chosen fields.
  const query = search.trim().toLowerCase();
  const filtered = items.filter(
    (item) =>
      (!filter || filter(item)) &&
      (!query || searchFields(item).some((f) => (f ?? '').toLowerCase().includes(query)))
  );

  return (
    <View style={styles.flex}>
      <Screen padded={false} edges={edges}>
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View style={styles.header}>
              <TextField
                label="Search"
                placeholder={searchPlaceholder}
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
                clearButtonMode="while-editing"
              />
              {filters}
            </View>
          }
          ListEmptyComponent={<Text style={styles.noMatch}>No entries match your search or filters.</Text>}
          renderItem={({ item }) => {
            const { title, subtitle, meta } = describe(item);
            return (
              <Card onPress={() => onEdit(item)} accessibilityLabel={`Edit ${title}`}>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>{title}</Text>
                  {badge ? badge(item) : null}
                </View>
                {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
                {meta ? <Text style={styles.meta}>{meta}</Text> : null}
              </Card>
            );
          }}
        />
      </Screen>
      <FAB accessibilityLabel={addLabel} onPress={onAdd} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  list: {
    padding: Spacing.lg,
    gap: Spacing.md,
    // Leave room at the bottom so the FAB never covers the last card.
    paddingBottom: Spacing.xxl * 3,
  },
  header: {
    gap: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  meta: {
    fontSize: FontSize.xs,
    color: Colors.mutedText,
  },
  noMatch: {
    fontSize: FontSize.sm,
    color: Colors.mutedText,
    textAlign: 'center',
  },
});
