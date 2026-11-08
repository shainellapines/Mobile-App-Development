import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { getDashboardData, getVaultCounts, type DashboardData, type VaultCounts } from '@/db/repositories/dashboardRepo';
import type { Profile } from '@/types/profile';
import { computeOjtProgress } from '@/utils/ojtProgress';
import { computeReadinessScore, type ReadinessInput } from '@/utils/readinessScore';
import { getRequirementStatus } from '@/utils/requirementStatus';

/** Which of the 4 required profile fields are still empty (Section 7.1). */
function missingProfileFields(profile: Profile | null): string[] {
  const checks: [string, string | null | undefined][] = [
    ['name', profile?.fullName],
    ['email', profile?.email],
    ['phone', profile?.phone],
    ['summary', profile?.summary],
  ];
  return checks.filter(([, value]) => !value?.trim()).map(([label]) => label);
}

/** Turns the raw dashboard data into the input of the pure score function. */
export function toReadinessInput(data: DashboardData): ReadinessInput {
  return {
    profileMissing: missingProfileFields(data.profile),
    educationCount: data.counts.education,
    experienceCount: data.counts.experiences,
    projectCount: data.counts.projects,
    skillCount: data.counts.skills,
    certificationCount: data.counts.certifications,
    requirements: data.requirements.map((r) => ({ name: r.name, status: getRequirementStatus(r) })),
    resumeCount: data.counts.resumes,
  };
}

/**
 * Dashboard data + Career Readiness Score + OJT progress.
 * Reloads every time the Home tab comes into focus (FR-H3), so the score
 * updates right after the user adds something elsewhere.
 */
export function useDashboard() {
  const db = useSQLiteContext();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      getDashboardData(db)
        .then(setData)
        .catch((e) => console.warn('[dashboard] load failed', e))
        .finally(() => setLoading(false));
    }, [db])
  );

  const readiness = data ? computeReadinessScore(toReadinessInput(data)) : null;
  const ojtProgress = data?.ojtInfo ? computeOjtProgress(data.ojtInfo.requiredHours, data.ojtLogs) : null;

  return { data, loading, readiness, ojtProgress };
}

/** How many entries each vault category has (for the Vault tab tiles). Reloads on focus. */
export function useVaultCounts() {
  const db = useSQLiteContext();
  const [counts, setCounts] = useState<VaultCounts | null>(null);

  useFocusEffect(
    useCallback(() => {
      getVaultCounts(db)
        .then(setCounts)
        .catch((e) => console.warn('[vault] counts failed', e));
    }, [db])
  );

  return counts;
}
