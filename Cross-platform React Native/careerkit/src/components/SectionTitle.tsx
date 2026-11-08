import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

type SectionTitleProps = {
  title: string;
  /** Optional small grey text after the title, e.g. "(3 selected)". */
  note?: string;
  /** Optional element on the right, e.g. a status badge. */
  right?: ReactNode;
};

/**
 * The heading at the top of a card ("Attachments", "Update status", ...).
 * One shared component, so every screen's section headings look exactly the same (NFR-6).
 */
export function SectionTitle({ title, note, right }: SectionTitleProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
        {note ? <Text style={styles.note}>{` ${note}`}</Text> : null}
      </Text>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  note: {
    fontWeight: FontWeight.regular,
    color: Colors.mutedText,
  },
});
