import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, BackHandler, StyleSheet, View } from 'react-native';

import { LockScreen } from '@/components/LockScreen';
import { LOCK_AFTER_BACKGROUND_MS } from '@/constants/security';
import { Colors } from '@/constants/theme';
import { isLockEnabled } from '@/services/authService';

type LockStatus = 'checking' | 'locked' | 'unlocked';

/**
 * App Lock gate (FR-L2), placed around the whole app in the root layout.
 * - On launch: locked if the user turned on App Lock.
 * - After the app was in the background for 1 minute or more: locked again.
 * The app stays mounted underneath (so you return to the same screen after unlocking);
 * the lock screen is simply drawn on top of it.
 */
export function AppLockGate({ children }: { children: ReactNode }) {
  // 'checking' draws a plain cover, so app content never flashes before we know the answer.
  const [status, setStatus] = useState<LockStatus>('checking');
  const backgroundSince = useRef<number | null>(null);

  useEffect(() => {
    /** Reads the setting and decides; only acts if we are still in 'checking'. */
    const decide = () =>
      isLockEnabled()
        .then((enabled) => setStatus((s) => (s === 'checking' ? (enabled ? 'locked' : 'unlocked') : s)))
        .catch((e) => {
          console.warn('[lock] check failed', e);
          setStatus('unlocked');
        });

    decide();

    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'background') {
        backgroundSince.current = Date.now();
      } else if (next === 'active' && backgroundSince.current !== null) {
        const awayMs = Date.now() - backgroundSince.current;
        backgroundSince.current = null;
        if (awayMs >= LOCK_AFTER_BACKGROUND_MS) {
          setStatus((s) => (s === 'unlocked' ? 'checking' : s));
          decide();
        }
      }
    });
    return () => subscription.remove();
  }, []);

  // While locked, the Android back button must not navigate the screens hidden underneath.
  useEffect(() => {
    if (status === 'unlocked') return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [status]);

  return (
    <View style={styles.flex}>
      {children}
      {status !== 'unlocked' ? (
        <View style={styles.cover}>
          {status === 'locked' ? <LockScreen onUnlock={() => setStatus('unlocked')} /> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  cover: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: Colors.background,
  },
});
