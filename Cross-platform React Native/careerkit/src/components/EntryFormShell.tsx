import { Stack } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { Colors } from '@/constants/theme';

type EntryFormShellProps = {
  /** Header title, e.g. "Add Education" or "Edit Education". */
  title: string;
  loading: boolean;
  /** True in edit mode when the record could not be found (e.g., it was deleted). */
  notFound: boolean;
  /** The form. Only rendered once loading is done, so it can read its starting values once. */
  children: ReactNode;
};

/** Wrapper for every add/edit screen: sets the header title, shows loading / not-found states. */
export function EntryFormShell({ title, loading, notFound, children }: EntryFormShellProps) {
  return (
    <>
      <Stack.Screen options={{ title }} />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : notFound ? (
        <Screen>
          <EmptyState icon="alert-circle-outline" title="Entry not found" message="It may have been deleted." />
        </Screen>
      ) : (
        children
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
