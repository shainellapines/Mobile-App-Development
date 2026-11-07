import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, FontSize, Radius, Spacing } from '@/constants/theme';

/**
 * BENTO GRID building blocks (step 3.4 design).
 * A bento layout is a grid of rounded tiles of DIFFERENT sizes, like a Japanese bento box:
 * the most important thing gets the biggest tile. We build it with plain flexbox:
 *   <BentoRow> places tiles side by side; each <Tile flex={n}> takes n shares of the row width.
 *   A tile alone in its row is full width.
 */

/** Tile background, from the MD3 tonal palette. */
export type TileTone = 'surface' | 'primary' | 'secondary';

const TONE_BACKGROUND: Record<TileTone, string> = {
  surface: Colors.surface,
  primary: Colors.primaryContainer,
  secondary: Colors.secondaryContainer,
};

/** The color of the "hole" or details drawn on a tile must match its background. */
export function toneBackground(tone: TileTone): string {
  return TONE_BACKGROUND[tone];
}

type TileProps = {
  children: ReactNode;
  tone?: TileTone;
  /** Share of the row width (default 1). */
  flex?: number;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function Tile({ children, tone = 'surface', flex = 1, onPress, accessibilityLabel, style }: TileProps) {
  const tileStyle = [styles.tile, { flex, backgroundColor: TONE_BACKGROUND[tone] }, style];
  if (!onPress) return <View style={tileStyle}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [tileStyle, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

/** A row of tiles. */
export function BentoRow({ children }: { children: ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

/** Round icon badge used at the top of tiles. `onTone` = the tile's tone, so the badge contrasts with it. */
export function TileIcon({
  name,
  onTone = 'surface',
}: {
  name: ComponentProps<typeof Ionicons>['name'];
  onTone?: TileTone;
}) {
  // On a white tile the badge is light blue; on a colored tile it is white.
  const badge = onTone === 'surface' ? Colors.primaryContainer : Colors.surface;
  return (
    <View style={[styles.icon, { backgroundColor: badge }]}>
      <Ionicons name={name} size={FontSize.lg} color={Colors.onPrimaryContainer} />
    </View>
  );
}

const ICON_BADGE = 40;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  tile: {
    borderRadius: Radius.tile,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  pressed: {
    opacity: 0.75,
  },
  icon: {
    width: ICON_BADGE,
    height: ICON_BADGE,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
