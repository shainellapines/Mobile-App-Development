import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

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

type VaultListScreenProps<T extends { id: number }> = {
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
};

/**
 * Shared list screen for every vault category (FR-V1, V4, V5):
 * loading spinner → empty state with "Add" button → searchable list of cards + FAB.
 * Each category only decides WHAT to show (describe, searchFields); this decides HOW.
 */
export function VaultListScreen<T extends { id: number }>({
  items,
  loading,
  describe,
  searchFields,
  searchPlaceholder,
  onAdd,
  onEdit,
  addLabel,
  empty,
}: VaultListScreenProps<T>) {
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
      <Screen>
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

  // Case-insensitive search across the chosen fields.
  const query = search.trim().toLowerCase();
  const filtered = query
    ? items.filter((item) => searchFields(item).some((f) => (f ?? '').toLowerCase().includes(query)))
    : items;

  return (
    <View style={styles.flex}>
      <Screen padded={false}>
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <TextField
              label="Search"
              placeholder={searchPlaceholder}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          }
          ListEmptyComponent={<Text style={styles.noMatch}>No entries match “{search}”.</Text>}
          renderItem={({ item }) => {
            const { title, subtitle, meta } = describe(item);
            return (
              <Card onPress={() => onEdit(item)} accessibilityLabel={`Edit ${title}`}>
                <Text style={styles.title}>{title}</Text>
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
  title: {
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
