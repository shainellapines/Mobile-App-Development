import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/Card';
import { FieldHint } from '@/components/FieldHint';
import { ProgressBar } from '@/components/ProgressBar';
import { ProgressRing } from '@/components/ProgressRing';
import { Screen } from '@/components/Screen';
import { StatusBadge } from '@/components/StatusBadge';
import { APPLICATION_STATUS_INFO, APPLICATION_STATUS_ORDER } from '@/constants/applications';
import { EXPIRING_SOON_DAYS, REQUIREMENT_STATUS_INFO } from '@/constants/requirements';
import { Colors, FontSize, FontWeight, MIN_TOUCH_SIZE, Radius, Spacing, StatusColors } from '@/constants/theme';
import type { DashboardData } from '@/db/repositories/dashboardRepo';
import { useDashboard } from '@/hooks/useDashboard';
import { formatDate } from '@/utils/dates';
import { formatHours } from '@/utils/ojtHours';
import type { OjtProgress } from '@/utils/ojtProgress';
import type { ReadinessCriterionId, ReadinessResult } from '@/utils/readinessScore';
import { expiryCountdown, getRequirementStatus, sortByUrgency } from '@/utils/requirementStatus';

type IconName = ComponentProps<typeof Ionicons>['name'];

const RING_SIZE = 120;
const RING_THICKNESS = 12;
const MAX_SUGGESTIONS = 3;
const MAX_DOCUMENTS_SHOWN = 3;

/** Where each suggestion takes the user, so they can fix it in one tap. */
const SUGGESTION_ROUTES: Record<ReadinessCriterionId, Href> = {
  profile: '/vault/profile',
  education: '/vault/education/form',
  experience: '/vault/experience/form',
  skills: '/vault/skills/form',
  certification: '/vault/certifications/form',
  requirements: '/requirements',
  resume: '/resume/builder',
};

/** Ring color follows the score bands: red → amber → teal → green. */
function scoreColor(score: number): string {
  if (score >= 90) return StatusColors.valid;
  if (score >= 70) return Colors.accent;
  if (score >= 40) return StatusColors.expiring_soon;
  return StatusColors.expired;
}

/** Dashboard (FR-H1–H3): readiness score, documents, applications, OJT, quick actions. */
export default function DashboardScreen() {
  const { data, loading, readiness, ojtProgress } = useDashboard();

  if (loading || !data || !readiness) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const ojtSetUp = data.ojtInfo !== null;

  return (
    <Screen scroll edges={['left', 'right']}>
      <ReadinessCard readiness={readiness} firstName={data.profile?.fullName.trim().split(' ')[0] ?? ''} />
      <DocumentsCard requirements={data.requirements} />
      <ApplicationsCard counts={data.applicationCounts} />
      {ojtProgress ? <OjtCard progress={ojtProgress} /> : null}

      <Card>
        <Text style={styles.heading}>Quick actions</Text>
        <View style={styles.actions}>
          <QuickAction icon="briefcase-outline" label="Add Experience" href="/vault/experience/form" />
          <QuickAction icon="document-text-outline" label="New Resume" href="/resume/builder" />
          <QuickAction
            icon="time-outline"
            label={ojtSetUp ? 'Log OJT Hours' : 'Set Up OJT'}
            href={ojtSetUp ? '/ojt/log-form' : '/ojt/setup'}
          />
        </View>
      </Card>

      <FieldHint>All your data stays on this phone. CareerKit works fully offline.</FieldHint>
    </Screen>
  );
}

// ── Career Readiness Score (FR-H1) ──────────────────────────────────────────

function ReadinessCard({ readiness, firstName }: { readiness: ReadinessResult; firstName: string }) {
  const { score, label, suggestions } = readiness;
  const color = scoreColor(score);

  return (
    <Card>
      <Text style={styles.greeting}>{firstName ? `Hi, ${firstName}!` : 'Welcome to CareerKit!'}</Text>
      <View style={styles.scoreRow}>
        <ProgressRing
          progress={score / 100}
          size={RING_SIZE}
          thickness={RING_THICKNESS}
          color={color}
          accessibilityLabel={`Career Readiness Score: ${score} out of 100`}>
          <Text style={styles.score}>{score}</Text>
          <Text style={styles.muted}>of 100</Text>
        </ProgressRing>
        <View style={styles.flex}>
          <Text style={styles.muted}>Career Readiness</Text>
          <Text style={[styles.scoreLabel, { color }]}>{label}</Text>
          <Text style={styles.body}>
            {suggestions.length === 0
              ? 'Everything is in place. Keep your documents valid and good luck!'
              : `${suggestions.length} step${suggestions.length === 1 ? '' : 's'} left to reach 100.`}
          </Text>
        </View>
      </View>

      {suggestions.slice(0, MAX_SUGGESTIONS).map((s) => (
        <Pressable
          key={s.id}
          onPress={() => router.push(SUGGESTION_ROUTES[s.id])}
          accessibilityRole="button"
          accessibilityLabel={`${s.suggestion}, plus ${s.points} points`}
          style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}>
          <Ionicons name="arrow-up-circle-outline" size={FontSize.lg} color={Colors.accent} />
          <Text style={styles.suggestionText}>{s.suggestion}</Text>
          <Text style={styles.points}>+{s.points}</Text>
        </Pressable>
      ))}
    </Card>
  );
}

// ── Documents expiring soon / expired (FR-H2) ───────────────────────────────

function DocumentsCard({ requirements }: { requirements: DashboardData['requirements'] }) {
  // Only expired and expiring-soon documents need attention here; most urgent first.
  const urgent = sortByUrgency(requirements).filter((r) => {
    const status = getRequirementStatus(r);
    return status === 'expired' || status === 'expiring_soon';
  });

  return (
    <Card onPress={() => router.push('/requirements')} accessibilityLabel="Open requirements">
      <CardTitle icon="shield-checkmark-outline" title="Documents" />
      {requirements.length === 0 ? (
        <FieldHint>No requirements yet. Use Smart Templates to add NBI, Police Clearance, and more.</FieldHint>
      ) : urgent.length === 0 ? (
        <Text style={styles.body}>{`Nothing expires in the next ${EXPIRING_SOON_DAYS} days.`}</Text>
      ) : (
        urgent.slice(0, MAX_DOCUMENTS_SHOWN).map((r) => {
          const info = REQUIREMENT_STATUS_INFO[getRequirementStatus(r)];
          return (
            <View key={r.id} style={styles.docRow}>
              <View style={styles.flex}>
                <Text style={styles.strong}>{r.name}</Text>
                <Text style={styles.muted}>{expiryCountdown(r)}</Text>
              </View>
              <StatusBadge label={info.label} color={info.color} />
            </View>
          );
        })
      )}
      {urgent.length > MAX_DOCUMENTS_SHOWN ? (
        <Text style={styles.muted}>{`+${urgent.length - MAX_DOCUMENTS_SHOWN} more need attention`}</Text>
      ) : null}
    </Card>
  );
}

// ── Applications by status (FR-H2) ──────────────────────────────────────────

function ApplicationsCard({ counts }: { counts: DashboardData['applicationCounts'] }) {
  const total = APPLICATION_STATUS_ORDER.reduce((sum, s) => sum + (counts[s] ?? 0), 0);

  return (
    <Card onPress={() => router.push('/applications')} accessibilityLabel="Open applications">
      <CardTitle icon="paper-plane-outline" title={`Applications (${total})`} />
      {total === 0 ? (
        <FieldHint>No applications yet. Log each job you apply to and the resume you sent.</FieldHint>
      ) : (
        <View style={styles.badges}>
          {APPLICATION_STATUS_ORDER.filter((s) => (counts[s] ?? 0) > 0).map((s) => (
            <StatusBadge
              key={s}
              label={`${APPLICATION_STATUS_INFO[s].label}: ${counts[s]}`}
              color={APPLICATION_STATUS_INFO[s].color}
            />
          ))}
        </View>
      )}
    </Card>
  );
}

// ── OJT progress (FR-H2, only when OJT is set up) ───────────────────────────

function OjtCard({ progress: p }: { progress: OjtProgress }) {
  const percent = Math.round(p.progress * 100);
  return (
    <Card onPress={() => router.push('/ojt' as Href)} accessibilityLabel="Open OJT Logger">
      <CardTitle icon="time-outline" title="OJT progress" />
      <Text style={styles.body}>
        <Text style={styles.strong}>{p.renderedHours}</Text>
        {` / ${formatHours(p.requiredHours)} · ${percent}%`}
      </Text>
      <ProgressBar
        progress={p.progress}
        color={p.isComplete ? StatusColors.valid : Colors.accent}
        accessibilityLabel={`OJT progress: ${percent} percent`}
      />
      <Text style={styles.muted}>
        {p.isComplete
          ? 'Required hours completed!'
          : p.estimatedEndDate
            ? `Estimated finish: ${formatDate(p.estimatedEndDate)}`
            : 'Log your first day to see an estimated finish date.'}
      </Text>
    </Card>
  );
}

// ── Small building blocks ───────────────────────────────────────────────────

function CardTitle({ icon, title }: { icon: IconName; title: string }) {
  return (
    <View style={styles.cardTitle}>
      <Ionicons name={icon} size={FontSize.lg} color={Colors.primary} />
      <Text style={[styles.heading, styles.flex]}>{title}</Text>
      <Ionicons name="chevron-forward" size={FontSize.lg} color={Colors.mutedText} />
    </View>
  );
}

function QuickAction({ icon, label, href }: { icon: IconName; label: string; href: Href }) {
  return (
    <Pressable
      onPress={() => router.push(href)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
      <Ionicons name={icon} size={FontSize.xl} color={Colors.primary} />
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  greeting: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  score: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  scoreLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  suggestion: {
    minHeight: MIN_TOUCH_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderRadius: Radius.control,
  },
  suggestionText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  points: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.accent,
  },
  heading: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  body: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  strong: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  muted: {
    fontSize: FontSize.xs,
    color: Colors.mutedText,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickAction: {
    flex: 1,
    minHeight: MIN_TOUCH_SIZE * 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.control,
    backgroundColor: Colors.background,
  },
  quickLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
