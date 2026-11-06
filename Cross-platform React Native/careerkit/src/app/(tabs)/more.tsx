import { router, type Href } from 'expo-router';

import { Card } from '@/components/Card';
import { ListItem } from '@/components/ListItem';
import { Screen } from '@/components/Screen';

/** More tab: Resume Builder now; OJT Logger (2.5) and Settings (3.1) arrive later. */
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
        <ListItem icon="time-outline" title="OJT Logger" subtitle="Coming soon" disabled />
        <ListItem icon="settings-outline" title="Settings" subtitle="Coming soon" disabled />
      </Card>
    </Screen>
  );
}
