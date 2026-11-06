/**
 * CareerKit design tokens (CLAUDE.md Section 8.1).
 * Screens and components must use these values instead of hard-coded colors or sizes.
 */

export const Colors = {
  primary: '#1E3A8A', // deep blue: trust, professional
  accent: '#0D9488', // teal
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  mutedText: '#64748B',
  border: '#E2E8F0',
  danger: '#DC2626',
  onPrimary: '#FFFFFF', // text/icon color placed on top of primary, accent, or danger
  overlay: 'rgba(15, 23, 42, 0.5)', // dimmed background behind dialogs
} as const;

/** Requirement status colors (FR-Q3). */
export const StatusColors = {
  valid: '#16A34A',
  expiring_soon: '#F59E0B',
  expired: '#DC2626',
  not_yet_obtained: '#64748B',
} as const;

/** Application status colors (FR-A2). */
export const ApplicationStatusColors = {
  applied: '#2563EB', // blue
  interview: '#7C3AED', // purple
  offer: '#16A34A', // green
  rejected: '#DC2626', // red
  withdrawn: '#64748B', // gray
} as const;

/** Spacing scale: 4, 8, 12, 16, 24, 32. */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  card: 12,
  control: 8, // inputs and buttons
  pill: 999, // fully rounded (badges, FAB)
} as const;

/** Font sizes: 12 / 14 / 16 / 20 / 24 / 32. The system font is used everywhere. */
export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const FontWeight = {
  regular: '400',
  semibold: '600',
} as const;

/** Minimum size of anything the user can tap (Section 8.3). */
export const MIN_TOUCH_SIZE = 44;
