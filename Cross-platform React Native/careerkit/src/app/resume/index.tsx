import { router } from 'expo-router';

import { EntryListScreen } from '@/components/EntryListScreen';
import { resumeTemplateLabel } from '@/constants/vault';
import { useResumes } from '@/hooks/useResumes';
import { formatDate } from '@/utils/dates';

/** Saved resume versions (FR-R5): tap to preview/share/edit, + to build a new one. */
export default function ResumeListScreen() {
  const { items, loading } = useResumes();

  return (
    <EntryListScreen
      items={items}
      loading={loading}
      describe={(r) => ({
        title: r.title,
        subtitle: [r.targetRole, resumeTemplateLabel(r.template)].filter(Boolean).join(' · '),
        meta: `Last edited ${formatDate(r.updatedAt.slice(0, 10))}`,
      })}
      searchFields={(r) => [r.title, r.targetRole]}
      searchPlaceholder="Resume name or target role"
      onAdd={() => router.push('/resume/builder')}
      onEdit={(r) => router.push({ pathname: '/resume/preview', params: { id: String(r.id) } })}
      addLabel="New Resume"
      empty={{
        icon: 'document-text-outline',
        title: 'No resumes yet',
        message: 'Pick entries from your vault and turn them into a clean, ATS-friendly PDF for each job.',
      }}
    />
  );
}
