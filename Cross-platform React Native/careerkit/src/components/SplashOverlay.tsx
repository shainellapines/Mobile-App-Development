import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { AppLogo } from '@/components/AppLogo';
import { Colors, FontSize, Spacing } from '@/constants/theme';

/** Splash timing, in milliseconds (all counted from when the logo is actually on screen). */
const ENTER_MS = 500; // logo fades in and grows slightly
const HOLD_MS = 1800; // logo stays fully visible
const EXIT_MS = 500; // whole splash fades out to reveal the app
/** If the logo image never reports "loaded", start anyway after this long. */
const LOAD_TIMEOUT_MS = 1500;
const LOGO_WIDTH = 200; // same width as the native splash image in app.json
const START_SCALE = 0.92;

// Keep the phone's native splash up until our own splash is drawn.
SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden (e.g. after a fast refresh): nothing to do.
});

/**
 * Branded splash screen, shown once when the app starts (about 2.8 s in total).
 * 1. The native splash (set in app.json) shows while the app loads, then hands over to this one.
 * 2. The timer starts only when the logo image has LOADED, so the user always sees it:
 *    fade + grow in (0.5 s) → hold (1.8 s) → fade out (0.5 s), revealing the app underneath.
 * Animated values are created once with a useState initializer and run on the native thread.
 */
export function SplashOverlay() {
  const [visible, setVisible] = useState(true);
  const [logoReady, setLogoReady] = useState(false);
  const [coverOpacity] = useState(() => new Animated.Value(1));
  const [content] = useState(() => new Animated.Value(0)); // 0 = hidden/small, 1 = shown/full size

  // Safety net: if the logo never reports "loaded", carry on anyway.
  useEffect(() => {
    const fallback = setTimeout(() => setLogoReady(true), LOAD_TIMEOUT_MS);
    return () => clearTimeout(fallback);
  }, []);

  // Logo on screen: play enter → hold → exit, then remove the overlay.
  useEffect(() => {
    if (!logoReady) return;
    // Only now hide the native splash, so there is never a blank moment in between.
    SplashScreen.hideAsync().catch(() => {});
    const animation = Animated.sequence([
      Animated.timing(content, { toValue: 1, duration: ENTER_MS, useNativeDriver: true }),
      Animated.delay(HOLD_MS),
      Animated.timing(coverOpacity, { toValue: 0, duration: EXIT_MS, useNativeDriver: true }),
    ]);
    animation.start(({ finished }) => {
      if (finished) setVisible(false);
    });
    return () => animation.stop();
  }, [logoReady, content, coverOpacity]);

  if (!visible) return null;

  const scale = content.interpolate({ inputRange: [0, 1], outputRange: [START_SCALE, 1] });

  return (
    <Animated.View style={[styles.cover, { opacity: coverOpacity }]} pointerEvents="none">
      <Animated.View style={[styles.content, { opacity: content, transform: [{ scale }] }]}>
        {/* The full logo already contains the "CareerKit" name. */}
        <AppLogo size={LOGO_WIDTH} variant="full" onLoad={() => setLogoReady(true)} />
        <Text style={styles.tagline}>From OJT to your first job</Text>
      </Animated.View>
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
  },
  content: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tagline: {
    fontSize: FontSize.md,
    color: Colors.mutedText,
  },
});
