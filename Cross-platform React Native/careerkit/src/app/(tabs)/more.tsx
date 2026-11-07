import { router, type Href } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/Screen';
import { BentoRow, Tile, TileIcon } from '@/components/Tile';
import { Colors, FontSize, FontWeight } from '@/constants/theme';

/** More tab as a bento grid: Resume Builder and OJT Logger side by side, Settings wide below. */
export default function MoreScreen() {
  return (
    <Screen scroll edges={['left', 'right']}>
      <BentoRow>
        <Tile
          tone="primary"
          // resume/index.tsx opens at /resume; generated route types list it as /resume/index.
          onPress={() => router.push('/resume' as Href)}
          accessibilityLabel="Open Resume Builder">
          <TileIcon name="document-text-outline" onTone="primary" />
          <Text style={styles.title}>Resume Builder</Text>
          <Text style={styles.muted}>Tailored PDF resumes from your vault</Text>
        </Tile>
        <Tile tone="secondary" onPress={() => router.push('/ojt' as Href)} accessibilityLabel="Open OJT Logger">
          <TileIcon name="time-outline" onTone="secondary" />
          <Text style={styles.title}>OJT Logger</Text>
          <Text style={styles.muted}>Hours, time records, OJT requirements</Text>
        </Tile>
      </BentoRow>
      <Tile onPress={() => router.push('/settings' as Href)} accessibilityLabel="Open Settings">
        <TileIcon name="settings-outline" />
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.muted}>App Lock, reset data, about</Text>
      </Tile>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  muted: {
    fontSize: FontSize.xs,
    color: Colors.mutedText,
  },
});
