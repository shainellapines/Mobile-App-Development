import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { AppLogo } from '@/components/AppLogo';
import { Colors, FontSize, Spacing } from '@/constants/theme';

/** How long the branded splash stays before fading out, and how long the fade takes. */
const SPLASH_MIN_MS = 1200;
const FADE_MS = 400;
const LOGO_WIDTH = 200; // same width as the native splash image in app.json

// Keep the phone's native splash up until our own (identical-looking) splash is drawn.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden (e.g. after a fast refresh): nothing to do.
});

/**
 * Branded splash screen, shown once when the app starts.
 * 1. The native splash (logo on the light background, set in app.json) shows while the app loads.
 * 2. As soon as this component appears, it hides the native splash. It looks the same, plus the
 *    tagline, so the switch is seamless.
 * 3. After SPLASH_MIN_MS it fades out, revealing the app (or the lock screen) underneath.
 */
export function SplashOverlay() {
  const [visible, setVisible] = useState(true);
  // Created once (useState initializer), then animated from 1 (visible) to 0 (gone).
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: true }).start(() =>
        setVisible(false)
      );
    }, SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, [opacity]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.cover, { opacity }]} pointerEvents="none">
      {/* The full logo already contains the "CareerKit" name. */}
      <AppLogo size={LOGO_WIDTH} variant="full" />
      <Text style={styles.tagline}>From OJT to your first job</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cover: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  tagline: {
    fontSize: FontSize.md,
    color: Colors.mutedText,
  },
});
