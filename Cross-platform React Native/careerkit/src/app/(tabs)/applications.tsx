import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';

/** PLACEHOLDER (step 1.3). Becomes the Application Tracker list in step 2.4. */
export default function ApplicationsScreen() {
  return (
    <Screen edges={['left', 'right']}>
      <EmptyState
        icon="paper-plane-outline"
        title="Application Tracker"
        message="Log where you applied, which resume you sent, and the status."
      />
    </Screen>
  );
}
