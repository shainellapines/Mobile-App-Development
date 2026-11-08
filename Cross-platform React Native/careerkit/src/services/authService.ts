import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';
import { AuthenticationType } from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

/**
 * authService: App Lock (FR-L1, L2). The only place that talks to expo-secure-store,
 * expo-local-authentication and expo-crypto.
 *
 * The PIN itself is NEVER stored (NFR-3). We store:
 *   salt = 16 random bytes (different for every user)
 *   hash = SHA-256(salt + PIN)
 * To check a PIN, we hash what was typed with the same salt and compare the two hashes.
 * The salt means two people with the same PIN still get different hashes.
 * Everything is kept in SecureStore (the phone's Keychain / Keystore), not in the SQLite file.
 */

const KEYS = {
  pinHash: 'careerkit_pin_hash',
  pinSalt: 'careerkit_pin_salt',
  pinLength: 'careerkit_pin_length',
  biometrics: 'careerkit_biometrics_enabled',
} as const;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPin(pin: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
}

// ── PIN ─────────────────────────────────────────────────────────────────────

/** True when the user has turned on App Lock (a PIN hash is saved). */
export async function isLockEnabled(): Promise<boolean> {
  return (await SecureStore.getItemAsync(KEYS.pinHash)) !== null;
}

/** Saves a new PIN (turns App Lock on, or changes the PIN). */
export async function setPin(pin: string): Promise<void> {
  const salt = toHex(Crypto.getRandomBytes(16));
  const hash = await hashPin(pin, salt);
  await SecureStore.setItemAsync(KEYS.pinSalt, salt);
  await SecureStore.setItemAsync(KEYS.pinHash, hash);
  // The length lets the lock screen check the PIN as soon as the last digit is typed.
  await SecureStore.setItemAsync(KEYS.pinLength, String(pin.length));
}

/** True when the typed PIN matches the saved one. */
export async function verifyPin(pin: string): Promise<boolean> {
  const [salt, savedHash] = await Promise.all([
    SecureStore.getItemAsync(KEYS.pinSalt),
    SecureStore.getItemAsync(KEYS.pinHash),
  ]);
  if (!salt || !savedHash) return false;
  return (await hashPin(pin, salt)) === savedHash;
}

/** How many digits the saved PIN has (null if none). */
export async function getPinLength(): Promise<number | null> {
  const value = await SecureStore.getItemAsync(KEYS.pinLength);
  return value ? Number(value) : null;
}

/** Turns App Lock off: removes the PIN and the biometrics choice. */
export async function disableLock(): Promise<void> {
  await Promise.all(Object.values(KEYS).map((key) => SecureStore.deleteItemAsync(key)));
}

// ── Biometrics (fingerprint / Face ID) ──────────────────────────────────────

export type BiometricSupport = {
  /** The phone has a sensor AND the user has registered a fingerprint/face in phone Settings. */
  available: boolean;
  /** "Fingerprint", "Face ID" or "Biometrics", for button labels. */
  label: string;
};

export async function getBiometricSupport(): Promise<BiometricSupport> {
  try {
    const [hasHardware, enrolled, types] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);
    const label = types.includes(AuthenticationType.FACIAL_RECOGNITION)
      ? 'Face ID'
      : types.includes(AuthenticationType.FINGERPRINT)
        ? 'Fingerprint'
        : 'Biometrics';
    return { available: hasHardware && enrolled, label };
  } catch (e) {
    console.warn('[auth] biometric check failed', e);
    return { available: false, label: 'Biometrics' };
  }
}

export async function isBiometricsEnabled(): Promise<boolean> {
  return (await SecureStore.getItemAsync(KEYS.biometrics)) === 'true';
}

export async function setBiometricsEnabled(enabled: boolean): Promise<void> {
  if (enabled) await SecureStore.setItemAsync(KEYS.biometrics, 'true');
  else await SecureStore.deleteItemAsync(KEYS.biometrics);
}

/**
 * Shows the phone's fingerprint / Face ID prompt. Returns true if it succeeded.
 * The phone's own passcode fallback is turned off: our PIN is the fallback (FR-L2).
 */
export async function authenticateWithBiometrics(): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock CareerKit',
      cancelLabel: 'Use PIN',
      disableDeviceFallback: true,
    });
    return result.success;
  } catch (e) {
    console.warn('[auth] biometric prompt failed', e);
    return false;
  }
}
