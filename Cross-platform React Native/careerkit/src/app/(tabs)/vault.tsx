import type Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Card } from '@/components/Card';
import { ListItem } from '@/components/ListItem';
import { Screen } from '@/components/Screen';
import { Colors, FontSize, FontWeight } from '@/constants/theme';
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

/** Career Vault home: the Profile plus the five vault categories. */
export default function VaultScreen() {
  // useProfile reloads on focus, so the name updates right after editing the profile.
  const { profile } = useProfile();

  const profileSubtitle = profile?.fullName
    ? [profile.fullName, profile.headline].filter(Boolean).join(' · ')
    : 'Not set up yet — tap to add your name and contact info';

  return (
    <Screen scroll edges={['left', 'right']}>
      <Card>
        <ListItem
          icon="person-circle-outline"
          title="Profile"
          subtitle={profileSubtitle}
          onPress={() => router.push('/vault/profile')}
        />
      </Card>

      <Text style={styles.section}>Categories</Text>
      <Card>
        {CATEGORIES.map((c) => (
          <ListItem
            key={c.title}
            icon={c.icon}
            title={c.title}
            subtitle={c.subtitle}
            onPress={() => router.push(c.href)}
          />
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.mutedText,
    textTransform: 'uppercase',
  },
});
