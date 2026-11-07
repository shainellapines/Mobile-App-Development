import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { BentoRow, Tile, TileIcon } from '@/components/Tile';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';
import type { VaultCounts } from '@/db/repositories/dashboardRepo';
import { useVaultCounts } from '@/hooks/useDashboard';
import { useProfile } from '@/hooks/useProfile';

type VaultCategory = {
  title: string;
  subtitle: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  href: Href;
};

/**
 * Each category's list is the index.tsx in its folder, which opens at e.g. /vault/education.
 * The generated route types list these as ".../index" instead, so we mark them as Href.
 */
const CATEGORIES: VaultCategory[] = [
  {
    title: 'Education',
    subtitle: 'Degrees, schools, honors',
    icon: 'school-outline',
    href: '/vault/education' as Href,
  },
  {
    title: 'Experience',
    subtitle: 'Jobs, OJT, volunteer work, organizations',
    icon: 'briefcase-outline',
    href: '/vault/experience' as Href,
  },
  {
    title: 'Projects',
    subtitle: 'Capstone, school, and personal projects',
    icon: 'code-slash-outline',
    href: '/vault/projects' as Href,
  },
  {
    title: 'Skills',
    subtitle: 'Technical, soft skills, languages, tools',
    icon: 'construct-outline',
    href: '/vault/skills' as Href,
  },
  {
    title: 'Certifications',
    subtitle: 'TESDA, online courses, licenses',
    icon: 'ribbon-outline',
    href: '/vault/certifications' as Href,
  },
];

/** How many entries are in each category (key of VaultCounts). */
const COUNT_KEYS: Record<string, keyof VaultCounts> = {
  Education: 'education',
  Experience: 'experiences',
  Projects: 'projects',
  Skills: 'skills',
  Certifications: 'certifications',
};

/**
 * Career Vault home as a bento grid: a wide Profile tile, then the five categories
 * as tiles (two per row, the last one wide) with how many entries each has.
 */
export default function VaultScreen() {
  // Both hooks reload on focus, so names and counts update right after editing.
  const { profile } = useProfile();
  const counts = useVaultCounts();

  const hasProfile = Boolean(profile?.fullName);
  const rows = [CATEGORIES.slice(0, 2), CATEGORIES.slice(2, 4), CATEGORIES.slice(4)];

  return (
    <Screen scroll edges={['left', 'right']}>
      <Tile tone="primary" onPress={() => router.push('/vault/profile')} accessibilityLabel="Edit profile">
        <View style={styles.profileRow}>
          <TileIcon name="person-outline" onTone="primary" />
          <View style={styles.flex}>
            <Text style={styles.tileTitle}>{hasProfile ? profile?.fullName : 'Set up your profile'}</Text>
            <Text style={styles.muted} numberOfLines={2}>
              {hasProfile
                ? profile?.headline || 'Add a headline, e.g. "BSIT Graduate | Front-End Developer"'
                : 'Your name and contact info appear at the top of every resume'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={FontSize.lg} color={Colors.onPrimaryContainer} />
        </View>
      </Tile>

      {rows.map((row) => (
        <BentoRow key={row[0].title}>
          {row.map((c) => {
            const count = counts?.[COUNT_KEYS[c.title]];
            return (
              <Tile key={c.title} onPress={() => router.push(c.href)} accessibilityLabel={`Open ${c.title}`}>
                <View style={styles.tileTop}>
                  <TileIcon name={c.icon} />
                  {count !== undefined ? <Text style={styles.count}>{count}</Text> : null}
                </View>
                <Text style={styles.tileTitle}>{c.title}</Text>
                <Text style={styles.muted} numberOfLines={2}>
                  {c.subtitle}
                </Text>
              </Tile>
            );
          })}
        </BentoRow>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  tileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  count: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  tileTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  muted: {
    fontSize: FontSize.xs,
    color: Colors.mutedText,
  },
});
