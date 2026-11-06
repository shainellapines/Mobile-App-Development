import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';

type ScreenProps = {
  children: ReactNode;
  /** Wrap content in a ScrollView (use for forms and long content). */
  scroll?: boolean;
  /** Add the standard screen padding. Turn off for full-width lists. */
  padded?: boolean;
  /**
   * Which sides should avoid the notch / home indicator.
   * Default skips 'top' because screens usually sit under a navigation header.
   */
  edges?: Edge[];
};

/**
 * Base wrapper for every screen: background color, safe area, padding,
 * and keeps the keyboard from covering inputs (Section 8.3).
 */
export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['left', 'right', 'bottom'],
}: ScreenProps) {
  const paddingStyle = padded ? styles.padded : undefined;

  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={paddingStyle}
            keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, paddingStyle]}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  padded: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
});
