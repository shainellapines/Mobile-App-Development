import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EntryFormShell } from '@/components/EntryFormShell';
import { FieldHint } from '@/components/FieldHint';
import { Screen } from '@/components/Screen';
import { Colors, FontSize, FontWeight } from '@/constants/theme';
import { resumeTemplateLabel } from '@/constants/vault';
import { useProfile } from '@/hooks/useProfile';
import { useResume, useResumeActions } from '@/hooks/useResumes';
import { useIdParam } from '@/hooks/useVaultEntries';
import type { Resume, ResumeItemType } from '@/types/resume';
import { formatDate } from '@/utils/dates';

const SECTION_LABELS: Record<ResumeItemType, string> = {
  education: 'Education',
  experience: 'Experience',
  project: 'Projects',
  skill: 'Skills',
  certification: 'Certifications',
};

/** "Education: 1 · Experience: 2 · Skills: 5" (only sections that have items). */
function sectionSummary(resume: Resume): string {
  const counts = new Map<ResumeItemType, number>();
  for (const item of resume.items) counts.set(item.itemType, (counts.get(item.itemType) ?? 0) + 1);
  const parts = (Object.keys(SECTION_LABELS) as ResumeItemType[])
    .filter((type) => counts.has(type))
    .map((type) => `${SECTION_LABELS[type]}: ${counts.get(type)}`);
  return parts.length > 0 ? parts.join(' · ') : 'Only your profile (no entries selected)';
}

/** Resume version details + PDF actions (FR-R4, R5). Opened as /resume/preview?id=3. */
export default function ResumePreviewScreen() {
  const id = useIdParam();
  const { entry, loading } = useResume(id);

  return (
    <EntryFormShell title="Resume" loading={loading} notFound={!entry}>
      {entry ? <ResumeDetails resume={entry} /> : null}
    </EntryFormShell>
  );
}

function ResumeDetails({ resume }: { resume: Resume }) {
  const { profile } = useProfile();
  const { previewPdf, sharePdf, duplicate, remove } = useResumeActions(resume);
  const [busy, setBusy] = useState<'preview' | 'share' | 'duplicate' | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const missingName = !profile?.fullName.trim();

  /** Runs an action with a spinner on its button and a friendly error message. */
  const run = async (kind: 'preview' | 'share' | 'duplicate', action: () => Promise<void>, failMessage: string) => {
    setBusy(kind);
    try {
      await action();
    } catch (e) {
      console.warn(`[resume] ${kind} failed`, e);
      const details = __DEV__ && e instanceof Error ? `\n\n(Details: ${e.message})` : '';
      Alert.alert('Something went wrong', failMessage + details);
    } finally {
      setBusy(null);
    }
  };

  const handleDuplicate = () =>
    run(
      'duplicate',
      async () => {
        const copyId = await duplicate();
        Alert.alert('Duplicated', 'A copy of this resume was created.');
        router.replace({ pathname: '/resume/preview', params: { id: String(copyId) } });
      },
      'Could not duplicate this resume.'
    );

  const handleDelete = async () => {
    setConfirmVisible(false);
    try {
      await remove();
      router.back();
    } catch (e) {
      console.warn('[resume] delete failed', e);
      Alert.alert('Could not delete', 'Something went wrong while deleting this resume.');
    }
  };

  return (
    <Screen scroll>
      <Card>
        <Text style={styles.title}>{resume.title}</Text>
        {resume.targetRole ? <Text style={styles.body}>Target role: {resume.targetRole}</Text> : null}
        <Text style={styles.body}>Template: {resumeTemplateLabel(resume.template)}</Text>
        <Text style={styles.meta}>{sectionSummary(resume)}</Text>
        <Text style={styles.meta}>Last edited {formatDate(resume.updatedAt.slice(0, 10))}</Text>
      </Card>

      {missingName ? (
        <Card>
          <Text style={styles.warning}>Your profile has no name yet</Text>
          <FieldHint>The top of your resume will say “Your Name” until you fill in your profile.</FieldHint>
          <Button title="Edit profile" icon="person-outline" variant="secondary" onPress={() => router.push('/vault/profile')} />
        </Card>
      ) : null}

      <Card>
        <Button
          title="Preview PDF"
          icon="eye-outline"
          loading={busy === 'preview'}
          disabled={busy !== null}
          onPress={() => run('preview', previewPdf, 'Could not create or open the PDF.')}
        />
        <Button
          title="Share PDF"
          icon="share-outline"
          variant="secondary"
          loading={busy === 'share'}
          disabled={busy !== null}
          onPress={() => run('share', sharePdf, 'Could not create or share the PDF.')}
        />
        <FieldHint>
          The PDF is rebuilt from your latest vault data every time, so recent edits are always included. Use Share to
          send it by email or Messenger, or save it to Files / Drive.
        </FieldHint>
      </Card>

      <Card>
        <Button
          title="Edit selection"
          icon="create-outline"
          variant="secondary"
          disabled={busy !== null}
          onPress={() => router.push({ pathname: '/resume/builder', params: { id: String(resume.id) } })}
        />
        <Button
          title="Duplicate"
          icon="copy-outline"
          variant="secondary"
          loading={busy === 'duplicate'}
          disabled={busy !== null}
          onPress={handleDuplicate}
        />
        <Button title="Delete resume" icon="trash" variant="danger" onPress={() => setConfirmVisible(true)} />
      </Card>

      <ConfirmDialog
        visible={confirmVisible}
        title="Delete this resume?"
        message="Your vault entries are kept. Applications that used this resume will no longer be linked to it."
        confirmLabel="Delete"
        destructive
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleDelete}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  body: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  meta: {
    fontSize: FontSize.xs,
    color: Colors.mutedText,
  },
  warning: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.danger,
  },
});
