import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';

/** PLACEHOLDER (step 1.3). Becomes the Requirements Tracker list in step 2.1. */
export default function RequirementsScreen() {
  return (
    <Screen edges={['left', 'right']}>
      <EmptyState
        icon="document-text-outline"
        title="Requirements Tracker"
        message="Track NBI, Police, Barangay clearances and more, with expiry reminders."
      />
    </Screen>
  );
}
