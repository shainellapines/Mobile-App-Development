import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';

type ProgressRingProps = {
  /** 0 to 1 (values outside are clamped). */
  progress: number;
  size: number;
  thickness: number;
  color?: string;
  /** Shown in the middle of the ring (e.g. the score). */
  children?: ReactNode;
  accessibilityLabel?: string;
};

/**
 * Circular progress (Section 8.2), drawn with plain Views, so no SVG library is needed.
 *
 * How it works:
 * 1. A full grey disk is the "track".
 * 2. The ring is split into a RIGHT and a LEFT half, each a clipping window (overflow: hidden).
 * 3. In each window sits a colored half-disk that starts hidden on the other side, and is ROTATED
 *    around the ring's center. As it turns, more of it slides into the window, filling the arc:
 *    the right half covers 0–50% (0°–180°), the left half covers 50–100% (180°–360°).
 * 4. A smaller disk in the background color is placed on top, turning the disk into a ring.
 */
export function ProgressRing({
  progress,
  size,
  thickness,
  color = Colors.accent,
  children,
  accessibilityLabel,
}: ProgressRingProps) {
  const p = Math.min(Math.max(progress, 0), 1);
  const half = size / 2;
  const rightDegrees = Math.min(p, 0.5) * 360; // 0..180
  const leftDegrees = Math.max(p - 0.5, 0) * 360; // 0..180

  const disk = { width: size, height: size, borderRadius: half };

  return (
    <View
      style={[styles.box, disk, { backgroundColor: Colors.border }]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(p * 100) }}>
      {/* Right window: shows a left half-disk that rotates in from the top (0% → 50%). */}
      {p > 0 ? (
        <View style={[styles.window, { left: half, width: half, height: size }]}>
          <View style={[disk, { left: -half, transform: [{ rotate: `${rightDegrees}deg` }] }]}>
            <View
              style={{
                width: half,
                height: size,
                backgroundColor: color,
                borderTopLeftRadius: half,
                borderBottomLeftRadius: half,
              }}
            />
          </View>
        </View>
      ) : null}

      {/* Left window: shows a right half-disk that rotates in from the bottom (50% → 100%). */}
      {p > 0.5 ? (
        <View style={[styles.window, { left: 0, width: half, height: size }]}>
          <View style={[disk, { transform: [{ rotate: `${leftDegrees}deg` }] }]}>
            <View
              style={{
                marginLeft: half,
                width: half,
                height: size,
                backgroundColor: color,
                borderTopRightRadius: half,
                borderBottomRightRadius: half,
              }}
            />
          </View>
        </View>
      ) : null}

      {/* The hole in the middle, with the label inside. */}
      <View
        style={[
          styles.hole,
          {
            width: size - thickness * 2,
            height: size - thickness * 2,
            borderRadius: half - thickness,
          },
        ]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  window: {
    position: 'absolute',
    top: 0,
    overflow: 'hidden',
  },
  hole: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
