/** App Lock settings (FR-L1, L2). */

/** The PIN is 4 to 6 digits. */
export const PIN_MIN_LENGTH = 4;
export const PIN_MAX_LENGTH = 6;

/** Lock again when the app returns after being in the background this long (1 minute). */
export const LOCK_AFTER_BACKGROUND_MS = 60 * 1000;

/** After this many wrong PINs in a row, the keypad pauses for LOCKOUT_SECONDS. */
export const MAX_PIN_ATTEMPTS = 5;
export const LOCKOUT_SECONDS = 30;
