import { Image } from 'expo-image';

/**
 * TEMPORARY placeholder logo ("CK" monogram with a check badge).
 * To use the final logo, replace assets/images/careerkit-logo.png (same file name);
 * the splash screen and onboarding both use this one file.
 */
const LOGO = require('@/assets/images/careerkit-logo.png');

export function AppLogo({ size }: { size: number }) {
  return <Image source={LOGO} style={{ width: size, height: size }} contentFit="contain" accessibilityLabel="CareerKit logo" />;
}
