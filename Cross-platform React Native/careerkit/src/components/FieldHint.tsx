import { StyleSheet, Text } from 'react-native';

import { Colors, FontSize } from '@/constants/theme';

/** Small grey helper text under a form field, e.g. "Leave empty if still ongoing." */
export function FieldHint({ children }: { children: string }) {
  return <Text style={styles.hint}>{children}</Text>;
}

const styles = StyleSheet.create({
  hint: {
    fontSize: FontSize.xs,
    color: Colors.mutedText,
  },
});
