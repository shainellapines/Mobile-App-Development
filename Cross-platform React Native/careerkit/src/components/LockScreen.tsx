import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PinPad } from '@/components/PinPad';
import { LOCKOUT_SECONDS, MAX_PIN_ATTEMPTS, PIN_MAX_LENGTH } from '@/constants/security';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import {
  authenticateWithBiometrics,
  getBiometricSupport,
  getPinLength,
  isBiometricsEnabled,
  verifyPin,
} from '@/services/authService';

const ICON_SIZE = 56;

/**
 * Full-screen lock (FR-L2). Biometrics are offered first if the user turned them on;
 * the PIN always works as the fallback. The PIN is checked as soon as the last digit is typed.
 */
export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('');
  const [pinLength, setPinLength] = useState(PIN_MAX_LENGTH);
  const [biometric, setBiometric] = useState<{ label: string } | null>(null);
  const [message, setMessage] = useState('');
  const [wrongCount, setWrongCount] = useState(0);
  const [lockoutLeft, setLockoutLeft] = useState(0); // seconds the keypad is paused

  const tryBiometrics = useCallback(async () => {
    if (await authenticateWithBiometrics()) onUnlock();
  }, [onUnlock]);

  // On open: read the PIN length and whether biometrics are on; if so, show the prompt right away.
  useEffect(() => {
    let active = true;
    (async () => {
      const [length, support, enabled] = await Promise.all([
        getPinLength(),
        getBiometricSupport(),
        isBiometricsEnabled(),
      ]);
      if (!active) return;
      if (length) setPinLength(length);
      if (support.available && enabled) {
        setBiometric({ label: support.label });
        tryBiometrics();
      }
    })().catch((e) => console.warn('[lock] setup failed', e));
    return () => {
      active = false;
    };
  }, [tryBiometrics]);

  // Counts the pause down once per second.
  useEffect(() => {
    if (lockoutLeft <= 0) return;
    const timer = setTimeout(() => setLockoutLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [lockoutLeft]);

  const handleChange = async (value: string) => {
    setPin(value);
    setMessage('');
    if (value.length < pinLength) return;

    if (await verifyPin(value)) {
      onUnlock();
      return;
    }
    // Wrong PIN: clear it, and pause the keypad after too many tries in a row.
    setPin('');
    const wrong = wrongCount + 1;
    if (wrong >= MAX_PIN_ATTEMPTS) {
      setWrongCount(0);
      setLockoutLeft(LOCKOUT_SECONDS);
      setMessage('Too many wrong tries.');
    } else {
      setWrongCount(wrong);
      setMessage(`Wrong PIN. ${MAX_PIN_ATTEMPTS - wrong} ${MAX_PIN_ATTEMPTS - wrong === 1 ? 'try' : 'tries'} left.`);
    }
  };

  const isFace = biometric?.label === 'Face ID';

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Ionicons name="lock-closed" size={ICON_SIZE} color={Colors.primary} />
        <Text style={styles.title}>CareerKit is locked</Text>
        <Text style={styles.subtitle}>
          {biometric ? `Enter your PIN or use ${biometric.label}` : 'Enter your PIN'}
        </Text>
        <Text style={styles.message} accessibilityLiveRegion="polite">
          {lockoutLeft > 0 ? `Too many wrong tries. Try again in ${lockoutLeft} s.` : message}
        </Text>
      </View>

      <PinPad
        value={pin}
        onChange={handleChange}
        maxLength={pinLength}
        disabled={lockoutLeft > 0}
        onBiometric={biometric ? tryBiometrics : undefined}
        biometricIcon={isFace ? 'scan-outline' : 'finger-print'}
        biometricLabel={biometric ? `Unlock with ${biometric.label}` : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.mutedText,
  },
  message: {
    minHeight: FontSize.md * 1.5, // keeps the layout still when a message appears
    fontSize: FontSize.sm,
    color: Colors.danger,
  },
});
