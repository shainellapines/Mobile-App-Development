import { router, type Href } from 'expo-router';

import { Card } from '@/components/Card';
import { ListItem } from '@/components/ListItem';
import { Screen } from '@/components/Screen';

/** More tab: Resume Builder, OJT Logger, Settings. */
export default function MoreScreen() {
  return (
    <Screen scroll edges={['left', 'right']}>
      <Card>
        <ListItem
          icon="document-text-outline"
          title="Resume Builder"
          subtitle="Create tailored PDF resumes from your vault"
          // resume/index.tsx opens at /resume; generated route types list it as /resume/index.
          onPress={() => router.push('/resume' as Href)}
        />
        <ListItem
          icon="time-outline"
          title="OJT Logger"
          subtitle="Rendered hours, daily time records, OJT requirements"
          onPress={() => router.push('/ojt' as Href)}
        />
        <ListItem
          icon="settings-outline"
          title="Settings"
          subtitle="App Lock, reset data, about"
          onPress={() => router.push('/settings' as Href)}
        />
      </Card>
    </Screen>
  );
}
