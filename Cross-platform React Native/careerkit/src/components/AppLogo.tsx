import { Image } from 'expo-image';

/**
 * The CareerKit logo, from two files made from the team's logo artwork:
 * - 'mark': just the glass "CK" symbol (square) — onboarding, small places.
 * - 'full': the symbol with the "CareerKit" wordmark under it — splash screen.
 * The images have transparent backgrounds, so they sit cleanly on any app color.
 * The app icon and the native splash (app.json) use the same artwork.
 */
const MARK = require('@/assets/images/careerkit-logo.png');
const FULL = require('@/assets/images/careerkit-logo-full.png');

/** Width ÷ height of careerkit-logo-full.png (854 × 745 px). */
const FULL_ASPECT = 854 / 745;

type AppLogoProps = {
  /** Width in points (the height follows the logo's shape). */
  size: number;
  variant?: 'mark' | 'full';
};

export function AppLogo({ size, variant = 'mark' }: AppLogoProps) {
  const isFull = variant === 'full';
  return (
    <Image
      source={isFull ? FULL : MARK}
      style={{ width: size, height: isFull ? size / FULL_ASPECT : size }}
      contentFit="contain"
      accessibilityLabel="CareerKit logo"
    />
  );
}
