import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';

/** Full-screen loading spinner, shown while a screen's data loads (Section 8.3). */
export function LoadingView() {
  return (
    <View style={styles.center} accessibilityLabel="Loading" accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
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
