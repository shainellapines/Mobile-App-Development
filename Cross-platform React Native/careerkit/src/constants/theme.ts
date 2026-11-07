/**
 * CareerKit design tokens (CLAUDE.md Section 8.1).
 * Screens and components must use these values instead of hard-coded colors or sizes.
 *
 * Design style (step 3.4): Material Design 3 + Bento Grid + Clean Minimalism.
 * - MD3 "tonal" colors: each brand color has a light CONTAINER version (for chips, tiles,
 *   icon boxes) and an ON-container color for text placed on top of it.
 * - Clean minimalism: cards have no borders; they stand out from a slightly grey background.
 * - Bento grid: big rounded tiles of different sizes (see components/Tile.tsx).
 */

export const Colors = {
  primary: '#1E3A8A', // deep blue: trust, professional
  accent: '#0D9488', // teal
  background: '#F1F5F9', // slightly grey, so white cards stand out without borders
  surface: '#FFFFFF',
  surfaceContainer: '#E8EDF4', // filled text fields, keypad keys
  primaryContainer: '#DCE4FB', // light blue tiles / icon boxes / FAB
  onPrimaryContainer: '#14286B',
  secondaryContainer: '#CCF2EC', // light teal: selected chips, tonal buttons
  onSecondaryContainer: '#0B5F57',
  outline: '#CBD5E1', // unselected chip borders
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

/** MD3 shape scale: bigger, softer corners. */
export const Radius = {
  tile: 24, // bento tiles
  card: 20,
  fab: 16,
  control: 12, // text fields, picker boxes
  chip: 8,
  pill: 999, // fully rounded (buttons, badges)
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

/** MD3 buttons are 48 tall (still above the 44 minimum). */
export const BUTTON_HEIGHT = 48;

/** Very soft shadow (MD3 elevation level 1) for floating things like the FAB. */
export const SoftShadow = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
} as const;
