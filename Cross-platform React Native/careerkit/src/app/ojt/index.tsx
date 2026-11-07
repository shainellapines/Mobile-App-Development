import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { EmptyState } from '@/components/EmptyState';
import { FieldHint } from '@/components/FieldHint';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { DEFAULT_REQUIRED_HOURS, RECENT_LOGS_SHOWN } from '@/constants/ojt';
import { Colors, FontSize, FontWeight, MIN_TOUCH_SIZE, Radius, Spacing, StatusColors } from '@/constants/theme';
import { useDtrExport, useOjtInfo, useOjtLogs, useOjtRequirements } from '@/hooks/useOjt';
import type { OjtInfo, OjtLog, OjtRequirement } from '@/types/ojt';
import { formatDate, toIsoDate } from '@/utils/dates';
import { formatHours, formatTimeRange } from '@/utils/ojtHours';
import { computeOjtProgress } from '@/utils/ojtProgress';

/** OJT Logger home (FR-O1–O4): progress, latest time records, and the requirements checklist. */
export default function OjtOverviewScreen() {
  const { info, loading: infoLoading } = useOjtInfo();
  const logs = useOjtLogs();
  const requirements = useOjtRequirements();

  if (infoLoading || logs.loading || requirements.loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!info) {
    return (
      <Screen>
        <EmptyState
          icon="briefcase-outline"
          title="Set up your OJT"
          message={`Enter your company and required hours (usually ${DEFAULT_REQUIRED_HOURS}). We'll track your rendered hours and add a checklist of common OJT requirements.`}
          actionLabel="Set up OJT"
          onAction={() => router.push('/ojt/setup')}
        />
      </Screen>
    );
  }

  const handleToggle = async (item: OjtRequirement) => {
    try {
      await requirements.toggleDone(item.id, !item.isDone);
    } catch (e) {
      console.warn('[ojt] toggle failed', e);
      Alert.alert('Could not update', 'Something went wrong while updating the checklist.');
    }
  };

  return (
    <Screen scroll>
      <ProgressCard info={info} logs={logs.items} />
      <LogsCard logs={logs.items} />
      <ChecklistCard items={requirements.items} onToggle={handleToggle} />
    </Screen>
  );
}

// ── Progress (FR-O3) ────────────────────────────────────────────────────────

function ProgressCard({ info, logs }: { info: OjtInfo; logs: OjtLog[] }) {
  const p = computeOjtProgress(info.requiredHours, logs);
  const percent = Math.round(p.progress * 100);
  // Behind schedule = the estimate lands after the target end date the user set.
  const behindTarget = Boolean(info.targetEndDate && p.estimatedEndDate && p.estimatedEndDate > info.targetEndDate);

  return (
    <Card>
      <View style={styles.titleRow}>
        <View style={styles.flex}>
          <Text style={styles.heading}>{info.company ?? 'My OJT'}</Text>
          {info.supervisor ? <Text style={styles.muted}>Supervisor: {info.supervisor}</Text> : null}
        </View>
        <SmallIconButton icon="create-outline" label="Edit OJT setup" onPress={() => router.push('/ojt/setup')} />
      </View>

      <Text style={styles.bigNumber}>
        {p.renderedHours}
        <Text style={styles.ofTotal}> / {formatHours(p.requiredHours)}</Text>
      </Text>
      <ProgressBar
        progress={p.progress}
        color={p.isComplete ? StatusColors.valid : Colors.accent}
        accessibilityLabel={`OJT progress: ${percent} percent`}
      />
      <Text style={styles.body}>
        {p.isComplete ? 'Required hours completed. Congratulations!' : `${percent}% done · ${formatHours(p.remainingHours)} to go`}
      </Text>

      {p.daysLogged > 0 ? (
        <Text style={styles.muted}>
          {`Average ${formatHours(p.averageHoursPerDay)} per day over ${p.daysLogged} ${p.daysLogged === 1 ? 'day' : 'days'}`}
        </Text>
      ) : null}
      {p.estimatedEndDate ? (
        <Text style={styles.body}>
          Estimated finish: <Text style={styles.strong}>{formatDate(p.estimatedEndDate)}</Text>
        </Text>
      ) : null}
      {info.targetEndDate ? (
        <Text style={[styles.muted, behindTarget && styles.behind]}>
          {`Target: ${formatDate(info.targetEndDate)}${behindTarget ? ' — you may need more hours per day' : ''}`}
        </Text>
      ) : null}
      <FieldHint>The estimate assumes you keep your current average and work Monday to Friday.</FieldHint>
    </Card>
  );
}

// ── Latest daily time records (FR-O2) ───────────────────────────────────────

function LogsCard({ logs }: { logs: OjtLog[] }) {
  const exportDtr = useDtrExport();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportDtr();
    } catch (e) {
      console.warn('[ojt] DTR export failed', e);
      Alert.alert('Could not export', 'Something went wrong while creating the DTR PDF.');
    } finally {
      setExporting(false);
    }
  };

  const today = toIsoDate(new Date());
  const loggedToday = logs.some((l) => l.logDate === today);
  const recent = logs.slice(0, RECENT_LOGS_SHOWN);

  return (
    <Card>
      <Text style={styles.heading}>Daily time records</Text>
      <Button
        title={loggedToday ? 'Add another time record' : "Log today's hours"}
        icon="add"
        onPress={() => router.push('/ojt/log-form')}
      />
      {recent.length === 0 ? <FieldHint>No time records yet. Log your first OJT day above.</FieldHint> : null}
      {recent.map((log) => (
        <Pressable
          key={log.id}
          onPress={() => router.push({ pathname: '/ojt/log-form', params: { id: String(log.id) } })}
          accessibilityRole="button"
          accessibilityLabel={`Edit time record for ${formatDate(log.logDate)}`}
          style={({ pressed }) => [styles.logRow, pressed && styles.pressed]}>
          <View style={styles.flex}>
            <Text style={styles.strong}>{formatDate(log.logDate)}</Text>
            <Text style={styles.muted}>{formatTimeRange(log.timeIn, log.timeOut)}</Text>
          </View>
          <Text style={styles.hours}>{formatHours(log.hours)}</Text>
          <Ionicons name="chevron-forward" size={FontSize.lg} color={Colors.mutedText} />
        </Pressable>
      ))}
      {logs.length > RECENT_LOGS_SHOWN ? (
        <Button
          title={`View all ${logs.length} records`}
          variant="secondary"
          icon="list-outline"
          onPress={() => router.push('/ojt/logs')}
        />
      ) : null}
      {logs.length > 0 ? (
        <Button
          title="Export DTR (PDF)"
          variant="secondary"
          icon="download-outline"
          loading={exporting}
          onPress={handleExport}
        />
      ) : null}
    </Card>
  );
}

// ── OJT requirements checklist (FR-O4) ──────────────────────────────────────

type ChecklistProps = {
  items: OjtRequirement[];
  onToggle: (item: OjtRequirement) => void;
};

function ChecklistCard({ items, onToggle }: ChecklistProps) {
  const today = toIsoDate(new Date());
  const doneCount = items.filter((i) => i.isDone).length;

  /** Second line under each item: due date, marked "Overdue" if it passed and the item is not done. */
  const dueText = (item: OjtRequirement): string | undefined => {
    if (!item.dueDate) return undefined;
    if (!item.isDone && item.dueDate < today) return `Overdue · was due ${formatDate(item.dueDate)}`;
    return `Due ${formatDate(item.dueDate)}`;
  };

  return (
    <Card>
      <Text style={styles.heading}>{`OJT requirements (${doneCount}/${items.length} done)`}</Text>
      {items.length > 0 ? (
        <ProgressBar
          progress={doneCount / items.length}
          color={StatusColors.valid}
          accessibilityLabel={`${doneCount} of ${items.length} OJT requirements done`}
        />
      ) : (
        <FieldHint>No requirements yet. Add the documents your school asks for.</FieldHint>
      )}

      {items.map((item) => (
        <View key={item.id} style={styles.checkRow}>
          <Checkbox label={item.name} description={dueText(item)} checked={item.isDone} onChange={() => onToggle(item)} />
          <SmallIconButton
            icon="chevron-forward"
            label={`Edit ${item.name}`}
            onPress={() => router.push({ pathname: '/ojt/requirement-form', params: { id: String(item.id) } })}
          />
        </View>
      ))}

      <Button
        title="Add requirement"
        icon="add"
        variant="secondary"
        onPress={() => router.push('/ojt/requirement-form')}
      />
      <FieldHint>Tap a box to mark it done. Tap the arrow to add a due date, notes, or attach a scanned copy.</FieldHint>
    </Card>
  );
}

function SmallIconButton({
  icon,
  label,
  onPress,
}: {
  icon: 'create-outline' | 'chevron-forward';
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
      <Ionicons name={icon} size={FontSize.lg} color={Colors.mutedText} />
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  heading: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  bigNumber: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  ofTotal: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    color: Colors.mutedText,
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
  behind: {
    color: Colors.danger,
  },
  logRow: {
    minHeight: MIN_TOUCH_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    borderRadius: Radius.control,
  },
  hours: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.accent,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
