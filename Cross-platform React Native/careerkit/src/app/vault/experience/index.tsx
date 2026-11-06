import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { FAB } from '@/components/FAB';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { experienceTypeLabel } from '@/constants/vault';
import { useExperiences } from '@/hooks/useExperiences';
import type { Experience } from '@/types/experience';
import { formatDateRange } from '@/utils/dates';

/** True if the search text appears in the title, organization, or location (case-insensitive). */
function matchesSearch(item: Experience, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === '') return true;
  return [item.title, item.organization, item.location ?? ''].some((field) =>
    field.toLowerCase().includes(q)
  );
}

/** Experience list (FR-V1, V4, V5): newest first, search, tap to edit, FAB to add. */
export default function ExperienceListScreen() {
  const { items, loading } = useExperiences();
  const [search, setSearch] = useState('');

  const goToAdd = () => router.push('/vault/experience/form');
  const goToEdit = (id: number) =>
    router.push({ pathname: '/vault/experience/form', params: { id: String(id) } });

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
          icon="briefcase-outline"
          title="No experiences yet"
          message="Add your OJT, jobs, volunteer work, and organization roles."
          actionLabel="Add Experience"
          onAction={goToAdd}
        />
      </Screen>
    );
  }

  const filtered = items.filter((item) => matchesSearch(item, search));

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
              placeholder="Title, company, or location"
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              clearButtonMode="while-editing"
            />
          }
          ListEmptyComponent={<Text style={styles.noMatch}>No experiences match “{search}”.</Text>}
          renderItem={({ item }) => (
            <Card onPress={() => goToEdit(item.id)} accessibilityLabel={`Edit ${item.title}`}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>
                {item.organization} · {experienceTypeLabel(item.type)}
              </Text>
              {formatDateRange(item.startDate, item.endDate) ? (
                <Text style={styles.meta}>{formatDateRange(item.startDate, item.endDate)}</Text>
              ) : null}
            </Card>
          )}
        />
      </Screen>
      <FAB accessibilityLabel="Add experience" onPress={goToAdd} />
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
