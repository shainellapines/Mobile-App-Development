import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';

/** PLACEHOLDER (step 1.3). Will link to OJT Logger, Resume Builder, and Settings as they are built. */
export default function MoreScreen() {
  return (
    <Screen edges={['left', 'right']}>
      <EmptyState
        icon="menu-outline"
        title="More"
        message="OJT Logger, Resume Builder, and Settings will appear here."
      />
    </Screen>
  );
}
