import Ionicons from '@expo/vector-icons/Ionicons';
import { router, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { FieldHint } from '@/components/FieldHint';
import { ProgressBar } from '@/components/ProgressBar';
import { ProgressRing } from '@/components/ProgressRing';
import { Screen } from '@/components/Screen';
import { StatusBadge } from '@/components/StatusBadge';
import { BentoRow, Tile, TileIcon, toneBackground } from '@/components/Tile';
import { APPLICATION_STATUS_INFO, APPLICATION_STATUS_ORDER } from '@/constants/applications';
import { EXPIRING_SOON_DAYS } from '@/constants/requirements';
import { Colors, FontSize, FontWeight, MIN_TOUCH_SIZE, Radius, Spacing, StatusColors } from '@/constants/theme';
import type { DashboardData } from '@/db/repositories/dashboardRepo';
import { useDashboard } from '@/hooks/useDashboard';
import { formatDate } from '@/utils/dates';
import { formatHours } from '@/utils/ojtHours';
import type { OjtProgress } from '@/utils/ojtProgress';
import type { ReadinessCriterionId, ReadinessResult } from '@/utils/readinessScore';
import { expiryCountdown, getRequirementStatus, sortByUrgency } from '@/utils/requirementStatus';

type IconName = ComponentProps<typeof Ionicons>['name'];

const RING_SIZE = 112;
const RING_THICKNESS = 12;
const MAX_SUGGESTIONS = 3;
const MAX_DOCUMENTS_SHOWN = 2;

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

/**
 * Dashboard (FR-H1–H3) as a BENTO GRID:
 *   [        Career Readiness (big hero tile)        ]
 *   [ Documents        ] [ Applications              ]
 *   [              OJT progress (wide)               ]
 *   [ Add Experience ] [ New Resume ] [ Log OJT Hours ]
 */
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
  const firstName = data.profile?.fullName.trim().split(' ')[0] ?? '';

  return (
    <Screen scroll edges={['left', 'right']}>
      <View style={styles.greeting}>
        <Text style={styles.hello}>{firstName ? `Hi, ${firstName}` : 'Welcome'}</Text>
        <Text style={styles.muted}>Your career toolkit at a glance</Text>
      </View>

      <ReadinessTile readiness={readiness} />

      <BentoRow>
        <DocumentsTile requirements={data.requirements} />
        <ApplicationsTile counts={data.applicationCounts} />
      </BentoRow>

      {ojtProgress ? <OjtTile progress={ojtProgress} /> : null}

      <BentoRow>
        <QuickAction icon="briefcase-outline" label="Add Experience" href="/vault/experience/form" />
        <QuickAction icon="document-text-outline" label="New Resume" href="/resume/builder" />
        <QuickAction
          icon="time-outline"
          label={ojtSetUp ? 'Log OJT Hours' : 'Set Up OJT'}
          href={ojtSetUp ? '/ojt/log-form' : '/ojt/setup'}
        />
      </BentoRow>

      <FieldHint>All your data stays on this phone. CareerKit works fully offline.</FieldHint>
    </Screen>
  );
}

// ── Career Readiness Score: the hero tile (FR-H1) ───────────────────────────

function ReadinessTile({ readiness }: { readiness: ReadinessResult }) {
  const { score, label, suggestions } = readiness;
  const color = scoreColor(score);

  return (
    <Tile tone="primary">
      <View style={styles.scoreRow}>
        <ProgressRing
          progress={score / 100}
          size={RING_SIZE}
          thickness={RING_THICKNESS}
          color={color}
          trackColor={Colors.surface}
          holeColor={toneBackground('primary')}
          accessibilityLabel={`Career Readiness Score: ${score} out of 100`}>
          <Text style={styles.score}>{score}</Text>
          <Text style={styles.muted}>of 100</Text>
        </ProgressRing>
        <View style={styles.flex}>
          <Text style={styles.overline}>CAREER READINESS</Text>
          <Text style={styles.scoreLabel}>{label}</Text>
          <Text style={styles.body}>
            {suggestions.length === 0
              ? 'Everything is in place. Keep your documents valid!'
              : `${suggestions.length} step${suggestions.length === 1 ? '' : 's'} left to reach 100`}
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
          <Text style={styles.suggestionText}>{s.suggestion}</Text>
          <View style={styles.pointsPill}>
            <Text style={styles.points}>+{s.points}</Text>
          </View>
        </Pressable>
      ))}
    </Tile>
  );
}

// ── Documents (FR-H2) ───────────────────────────────────────────────────────

function DocumentsTile({ requirements }: { requirements: DashboardData['requirements'] }) {
  // Expired and expiring-soon documents need attention; most urgent first.
  const urgent = sortByUrgency(requirements).filter((r) => {
    const status = getRequirementStatus(r);
    return status === 'expired' || status === 'expiring_soon';
  });
  const hasExpired = urgent.some((r) => getRequirementStatus(r) === 'expired');

  return (
    <Tile onPress={() => router.push('/requirements')} accessibilityLabel="Open requirements">
      <TileIcon name="shield-checkmark-outline" />
      <Text style={styles.tileTitle}>Documents</Text>
      {requirements.length === 0 ? (
        <Text style={styles.muted}>Add NBI, Police Clearance and more with Smart Templates</Text>
      ) : urgent.length === 0 ? (
        <>
          <Text style={[styles.bigNumber, { color: StatusColors.valid }]}>✓</Text>
          <Text style={styles.muted}>{`Nothing expires in ${EXPIRING_SOON_DAYS} days`}</Text>
        </>
      ) : (
        <>
          <Text style={[styles.bigNumber, { color: hasExpired ? StatusColors.expired : StatusColors.expiring_soon }]}>
            {urgent.length}
          </Text>
          <Text style={styles.muted}>need attention</Text>
          {urgent.slice(0, MAX_DOCUMENTS_SHOWN).map((r) => (
            <Text key={r.id} style={styles.small} numberOfLines={2}>
              <Text style={styles.strong}>{r.name}</Text> · {expiryCountdown(r)}
            </Text>
          ))}
        </>
      )}
    </Tile>
  );
}

// ── Applications (FR-H2) ────────────────────────────────────────────────────

function ApplicationsTile({ counts }: { counts: DashboardData['applicationCounts'] }) {
  const total = APPLICATION_STATUS_ORDER.reduce((sum, s) => sum + (counts[s] ?? 0), 0);

  return (
    <Tile onPress={() => router.push('/applications')} accessibilityLabel="Open applications">
      <TileIcon name="paper-plane-outline" />
      <Text style={styles.tileTitle}>Applications</Text>
      <Text style={styles.bigNumber}>{total}</Text>
      {total === 0 ? (
        <Text style={styles.muted}>Log each job you apply to</Text>
      ) : (
        <View style={styles.badges}>
          {APPLICATION_STATUS_ORDER.filter((s) => (counts[s] ?? 0) > 0).map((s) => (
            <StatusBadge
              key={s}
              label={`${APPLICATION_STATUS_INFO[s].label} ${counts[s]}`}
              color={APPLICATION_STATUS_INFO[s].color}
            />
          ))}
        </View>
      )}
    </Tile>
  );
}

// ── OJT progress (FR-H2, only when OJT is set up) ───────────────────────────

function OjtTile({ progress: p }: { progress: OjtProgress }) {
  const percent = Math.round(p.progress * 100);
  return (
    <Tile tone="secondary" onPress={() => router.push('/ojt' as Href)} accessibilityLabel="Open OJT Logger">
      <View style={styles.ojtHead}>
        <View style={styles.flex}>
          <Text style={styles.overline}>OJT PROGRESS</Text>
          <Text style={styles.ojtHours}>
            {p.renderedHours}
            <Text style={styles.muted}>{` / ${formatHours(p.requiredHours)}`}</Text>
          </Text>
        </View>
        <Text style={styles.percent}>{percent}%</Text>
      </View>
      <ProgressBar
        progress={p.progress}
        color={p.isComplete ? StatusColors.valid : Colors.accent}
        accessibilityLabel={`OJT progress: ${percent} percent`}
      />
      <Text style={styles.small}>
        {p.isComplete
          ? 'Required hours completed!'
          : p.estimatedEndDate
            ? `Estimated finish: ${formatDate(p.estimatedEndDate)}`
            : 'Log your first day to see an estimated finish date.'}
      </Text>
    </Tile>
  );
}

// ── Quick actions: three small square tiles ─────────────────────────────────

function QuickAction({ icon, label, href }: { icon: IconName; label: string; href: Href }) {
  return (
    <Tile onPress={() => router.push(href)} accessibilityLabel={label} style={styles.quickTile}>
      <TileIcon name={icon} />
      <Text style={styles.quickLabel}>{label}</Text>
    </Tile>
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
    gap: 2,
  },
  hello: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  overline: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1,
    color: Colors.onPrimaryContainer,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  score: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  scoreLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  suggestion: {
    minHeight: MIN_TOUCH_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.control,
    backgroundColor: Colors.surface,
  },
  suggestionText: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  pointsPill: {
    borderRadius: Radius.pill,
    backgroundColor: Colors.secondaryContainer,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  points: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.onSecondaryContainer,
  },
  tileTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  bigNumber: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  ojtHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  ojtHours: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  percent: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.onSecondaryContainer,
  },
  body: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  small: {
    fontSize: FontSize.xs,
    color: Colors.text,
  },
  strong: {
    fontWeight: FontWeight.semibold,
  },
  muted: {
    fontSize: FontSize.xs,
    color: Colors.mutedText,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  quickTile: {
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  quickLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
