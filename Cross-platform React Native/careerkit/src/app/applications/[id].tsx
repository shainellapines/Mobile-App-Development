import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EntryFormShell } from '@/components/EntryFormShell';
import { FieldHint } from '@/components/FieldHint';
import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/SectionTitle';
import { StatusBadge } from '@/components/StatusBadge';
import { APPLICATION_STATUS_INFO, APPLICATION_STATUS_ORDER } from '@/constants/applications';
import { Colors, FontSize, FontWeight, MIN_TOUCH_SIZE, Radius, Spacing } from '@/constants/theme';
import { useApplication } from '@/hooks/useApplications';
import { useResume, useResumeActions } from '@/hooks/useResumes';
import { useIdParam } from '@/hooks/useVaultEntries';
import type { Application, ApplicationStatus } from '@/types/application';
import { formatDate } from '@/utils/dates';

/** Application details (FR-A2, A4). Opened as /applications/3. */
export default function ApplicationDetailScreen() {
  const id = useIdParam();
  const { entry, loading, changeStatus } = useApplication(id);

  return (
    <EntryFormShell title="Application" loading={loading} notFound={!entry}>
      {entry ? <ApplicationDetails application={entry} onChangeStatus={changeStatus} /> : null}
    </EntryFormShell>
  );
}

type DetailsProps = {
  application: Application;
  onChangeStatus: (status: ApplicationStatus) => Promise<void>;
};

function ApplicationDetails({ application: a, onChangeStatus }: DetailsProps) {
  const info = APPLICATION_STATUS_INFO[a.status];

  const handleStatus = async (status: ApplicationStatus) => {
    if (status === a.status) return;
    try {
      await onChangeStatus(status);
    } catch (e) {
      console.warn('[applications] status change failed', e);
      Alert.alert('Could not update', 'Something went wrong while changing the status.');
    }
  };

  return (
    <Screen scroll>
      <Card>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{a.position}</Text>
          <StatusBadge label={info.label} color={info.color} />
        </View>
        <Text style={styles.body}>{a.company}</Text>
        <Detail label="Applied" value={`${formatDate(a.dateApplied)}${a.channel ? ` via ${a.channel}` : ''}`} />
        {a.nextStepDate ? <Detail label="Next step" value={formatDate(a.nextStepDate)} /> : null}
        {a.salaryOffer ? <Detail label="Salary offer" value={a.salaryOffer} /> : null}
        {a.notes ? <Detail label="Notes" value={a.notes} /> : null}
      </Card>

      {/* Quick status change (FR-A2): one tap moves the application along the pipeline. */}
      <Card>
        <SectionTitle title="Update status" />
        <View style={styles.statusGrid}>
          {APPLICATION_STATUS_ORDER.map((status) => {
            const s = APPLICATION_STATUS_INFO[status];
            const selected = status === a.status;
            return (
              <Pressable
                key={status}
                onPress={() => handleStatus(status)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                accessibilityLabel={`Set status to ${s.label}`}
                style={({ pressed }) => [
                  styles.statusChip,
                  { borderColor: s.color },
                  selected && { backgroundColor: s.color },
                  pressed && styles.pressed,
                ]}>
                {/* Same as the MD3 filter chips: a check mark marks the current status. */}
                {selected ? <Ionicons name="checkmark" size={FontSize.md} color={Colors.onPrimary} /> : null}
                <Text style={[styles.statusText, { color: selected ? Colors.onPrimary : s.color }]}>{s.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <ResumeSentCard resumeId={a.resumeId} />

      <Button
        title="Edit application"
        icon="create-outline"
        variant="secondary"
        onPress={() => router.push({ pathname: '/applications/form', params: { id: String(a.id) } })}
      />
    </Screen>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.body}>{value}</Text>
    </View>
  );
}

/** Which resume version was sent, with buttons to open or share its PDF (FR-A4). */
function ResumeSentCard({ resumeId }: { resumeId: number | null }) {
  const { entry: resume, loading } = useResume(resumeId ?? undefined);
  const { previewPdf, sharePdf } = useResumeActions(resume);
  const [busy, setBusy] = useState<'preview' | 'share' | null>(null);

  const run = async (kind: 'preview' | 'share', action: () => Promise<void>) => {
    setBusy(kind);
    try {
      await action();
    } catch (e) {
      console.warn(`[applications] resume ${kind} failed`, e);
      Alert.alert('Something went wrong', 'Could not create or open the resume PDF.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <SectionTitle title="Resume sent" />
      {resumeId === null ? (
        <FieldHint>No resume linked. Edit the application to choose the version you sent.</FieldHint>
      ) : loading ? null : !resume ? (
        <FieldHint>The linked resume was deleted.</FieldHint>
      ) : (
        <>
          <Text style={styles.body}>{resume.title}</Text>
          <Button
            title="Open PDF"
            icon="eye-outline"
            variant="secondary"
            loading={busy === 'preview'}
            disabled={busy !== null}
            onPress={() => run('preview', previewPdf)}
          />
          <Button
            title="Share PDF"
            icon="share-outline"
            variant="secondary"
            loading={busy === 'share'}
            disabled={busy !== null}
            onPress={() => run('share', sharePdf)}
          />
          <FieldHint>The PDF is rebuilt from this resume version with your latest vault data.</FieldHint>
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  body: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  detail: {
    gap: 2,
  },
  detailLabel: {
    fontSize: FontSize.xs,
    color: Colors.mutedText,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statusChip: {
    minHeight: MIN_TOUCH_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.chip,
    borderWidth: 1,
    backgroundColor: Colors.surface,
  },
  statusText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  pressed: {
    opacity: 0.7,
  },
});
