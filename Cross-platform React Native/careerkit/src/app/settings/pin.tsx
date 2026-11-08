import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { PinPad } from '@/components/PinPad';
import { Screen } from '@/components/Screen';
import { PIN_MAX_LENGTH, PIN_MIN_LENGTH } from '@/constants/security';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { disableLock, getPinLength, setPin, verifyPin } from '@/services/authService';
import { isValidPin } from '@/utils/validators';

/** set = turn App Lock on, change = new PIN, disable = turn App Lock off. */
type Mode = 'set' | 'change' | 'disable';
/** current = prove you know the old PIN; new = type a new PIN; confirm = type it again. */
type Step = 'current' | 'new' | 'confirm';

const TITLES: Record<Mode, string> = {
  set: 'Turn On App Lock',
  change: 'Change PIN',
  disable: 'Turn Off App Lock',
};

const PROMPTS: Record<Step, string> = {
  current: 'Enter your current PIN',
  new: `Choose a ${PIN_MIN_LENGTH}–${PIN_MAX_LENGTH} digit PIN`,
  confirm: 'Enter the same PIN again',
};

/**
 * PIN flows (FR-L1). Changing or removing the PIN first asks for the CURRENT PIN,
 * so someone holding an unlocked phone cannot simply switch the lock off.
 */
export default function PinScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode: Mode = params.mode === 'change' || params.mode === 'disable' ? params.mode : 'set';

  const [step, setStep] = useState<Step>(mode === 'set' ? 'new' : 'current');
  const [value, setValue] = useState('');
  const [newPin, setNewPin] = useState('');
  const [currentLength, setCurrentLength] = useState(PIN_MAX_LENGTH);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPinLength()
      .then((length) => length && setCurrentLength(length))
      .catch((e) => console.warn('[pin] read length failed', e));
  }, []);

  const finish = (title: string, text: string) => {
    Alert.alert(title, text);
    router.back();
  };

  /** Step 1 (change / disable): checked automatically when the last digit is typed. */
  const checkCurrent = async (pin: string) => {
    if (!(await verifyPin(pin))) {
      setValue('');
      setMessage('Wrong PIN. Try again.');
      return;
    }
    if (mode === 'disable') {
      await disableLock();
      finish('App Lock is off', 'CareerKit will open without a PIN.');
      return;
    }
    setValue('');
    setStep('new');
  };

  /** Step 3: the second entry must match the first. */
  const checkConfirm = async (pin: string) => {
    if (pin !== newPin) {
      setValue('');
      setNewPin('');
      setStep('new');
      setMessage("The PINs didn't match. Please choose your PIN again.");
      return;
    }
    setSaving(true);
    try {
      await setPin(pin);
      finish(
        mode === 'set' ? 'App Lock is on' : 'PIN changed',
        mode === 'set'
          ? 'CareerKit will ask for your PIN when it opens and after 1 minute in the background.'
          : 'Use your new PIN from now on.'
      );
    } catch (e) {
      console.warn('[pin] save failed', e);
      Alert.alert('Could not save', 'Something went wrong while saving your PIN.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (next: string) => {
    setValue(next);
    setMessage('');
    if (step === 'current' && next.length === currentLength) checkCurrent(next);
    if (step === 'confirm' && next.length === newPin.length) checkConfirm(next);
  };

  /** Step 2 has a Next button, because the new PIN may be 4, 5 or 6 digits long. */
  const handleNext = () => {
    if (!isValidPin(value)) {
      setMessage(`Use ${PIN_MIN_LENGTH} to ${PIN_MAX_LENGTH} digits.`);
      return;
    }
    setNewPin(value);
    setValue('');
    setStep('confirm');
  };

  const maxLength = step === 'current' ? currentLength : step === 'confirm' ? newPin.length : PIN_MAX_LENGTH;

  return (
    <Screen>
      <Stack.Screen options={{ title: TITLES[mode] }} />
      <View style={styles.container}>
        <Text style={styles.prompt}>{PROMPTS[step]}</Text>
        <Text style={styles.message} accessibilityLiveRegion="polite">
          {message}
        </Text>
        <PinPad value={value} onChange={handleChange} maxLength={maxLength} disabled={saving} />
        {step === 'new' ? (
          <View style={styles.next}>
            <Button title="Next" icon="arrow-forward" onPress={handleNext} disabled={value.length < PIN_MIN_LENGTH} />
          </View>
        ) : null}
        {step !== 'current' ? (
          <Text style={styles.hint}>Only a scrambled version (hash) of your PIN is saved on this phone.</Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  prompt: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  message: {
    minHeight: FontSize.md * 1.5,
    fontSize: FontSize.sm,
    color: Colors.danger,
    textAlign: 'center',
  },
  next: {
    alignSelf: 'stretch',
  },
  hint: {
    fontSize: FontSize.xs,
    color: Colors.mutedText,
    textAlign: 'center',
  },
});
