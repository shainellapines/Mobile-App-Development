import { router, type Href } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Card } from '@/components/Card';
import { ListItem } from '@/components/ListItem';
import { Screen } from '@/components/Screen';
import { Colors, FontSize, FontWeight } from '@/constants/theme';
import { useProfile } from '@/hooks/useProfile';

/**
 * Career Vault home: the Profile plus the five vault categories.
 * Categories not built yet (step 1.6) are shown disabled.
 */
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
        <ListItem icon="school-outline" title="Education" subtitle="Coming soon" disabled />
        <ListItem
          icon="briefcase-outline"
          title="Experience"
          subtitle="Jobs, OJT, volunteer work, organizations"
          // The folder's index.tsx opens at /vault/experience. The generated route types list it
          // as ".../index" instead, so we tell TypeScript this path is valid.
          onPress={() => router.push('/vault/experience' as Href)}
        />
        <ListItem icon="code-slash-outline" title="Projects" subtitle="Coming soon" disabled />
        <ListItem icon="construct-outline" title="Skills" subtitle="Coming soon" disabled />
        <ListItem icon="ribbon-outline" title="Certifications" subtitle="Coming soon" disabled />
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
