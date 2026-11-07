import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense, useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppLockGate } from '@/components/AppLockGate';
import { Colors, FontWeight } from '@/constants/theme';
import { DATABASE_NAME, initDatabase } from '@/db/client';
import { initNotifications } from '@/services/notificationService';

// If opening the DB or a migration fails, Expo Router shows its error screen with a "Retry" button.
export { ErrorBoundary } from 'expo-router';

/**
 * Root layout:
 * - Opens the SQLite database and runs migrations (SQLiteProvider + initDatabase) BEFORE any
 *   screen renders, so every screen can safely use the DB. A spinner shows while that happens.
 * - Wraps every screen in a Stack navigator with the CareerKit header style.
 * - Sets up local notifications (expiry reminders).
 * - AppLockGate draws the PIN / biometrics lock screen on top when App Lock is on (FR-L2).
 */
export default function RootLayout() {
  // Set up local notifications once (banner style + Android channel) for expiry reminders.
  useEffect(() => {
    initNotifications().catch((e) => console.warn('[notifications] init failed', e));
  }, []);

  return (
    <AppLockGate>
      <StatusBar style="dark" />
      <Suspense fallback={<LoadingScreen />}>
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase} useSuspense>
          <Stack
            screenOptions={{
              // Clean minimal header: same color as the screen, dark text, no shadow line.
              headerStyle: { backgroundColor: Colors.background },
              headerTintColor: Colors.text,
              headerTitleStyle: { fontWeight: FontWeight.semibold },
              headerShadowVisible: false,
              contentStyle: { backgroundColor: Colors.background },
            }}>
            {/* The tabs draw their own headers, so the Stack header is hidden for them. */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="vault/profile" options={{ title: 'Edit Profile' }} />
            {/* Vault category lists. Each form sets its own title ("Add …" / "Edit …"). */}
            <Stack.Screen name="vault/education/index" options={{ title: 'Education' }} />
            <Stack.Screen name="vault/experience/index" options={{ title: 'Experience' }} />
            <Stack.Screen name="vault/projects/index" options={{ title: 'Projects' }} />
            <Stack.Screen name="vault/skills/index" options={{ title: 'Skills' }} />
            <Stack.Screen name="vault/certifications/index" options={{ title: 'Certifications' }} />
            <Stack.Screen name="resume/index" options={{ title: 'Resumes' }} />
            <Stack.Screen name="requirements/templates" options={{ title: 'Smart Templates' }} />
            <Stack.Screen name="ojt/index" options={{ title: 'OJT Logger' }} />
            <Stack.Screen name="ojt/logs" options={{ title: 'Daily Time Records' }} />
            <Stack.Screen name="settings/index" options={{ title: 'Settings' }} />
          </Stack>
        </SQLiteProvider>
      </Suspense>
    </AppLockGate>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
});
