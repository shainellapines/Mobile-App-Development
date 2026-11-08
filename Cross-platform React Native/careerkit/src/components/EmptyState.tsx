import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Colors, FontSize, FontWeight, Radius, Spacing } from '@/constants/theme';

type EmptyStateProps = {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  message?: string;
  /** Label and handler for the "Add" button (FR-V4). Both are needed to show the button. */
  actionLabel?: string;
  onAction?: () => void;
  /** Optional extra content under the button (e.g. a second action). */
  children?: ReactNode;
};

/** Friendly placeholder shown when a list has no data yet. */
export function EmptyState({ icon, title, message, actionLabel, onAction, children }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={FontSize.xxl + Spacing.sm} color={Colors.onPrimaryContainer} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} icon="add" onPress={onAction} />
      ) : null}
      {children}
    </View>
  );
}

const ICON_CIRCLE = 96;

const styles = StyleSheet.create({
  iconCircle: {
    width: ICON_CIRCLE,
    height: ICON_CIRCLE,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: FontSize.sm,
    color: Colors.mutedText,
    textAlign: 'center',
  },
});
