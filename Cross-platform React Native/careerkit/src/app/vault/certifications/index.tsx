import { router } from 'expo-router';

import { EntryListScreen } from '@/components/EntryListScreen';
import { useCertifications } from '@/hooks/useVaultEntries';
import type { Certification } from '@/types/certification';
import { formatDate } from '@/utils/dates';

/** "Issued Mar 3, 2026 · Expires Mar 3, 2029" (only the parts that exist). */
function certDates(c: Certification): string {
  const parts: string[] = [];
  if (c.issueDate) parts.push(`Issued ${formatDate(c.issueDate)}`);
  if (c.expiryDate) parts.push(`Expires ${formatDate(c.expiryDate)}`);
  return parts.join(' · ');
}

/** Certifications list: newest issue date first, search, tap to edit, + to add. */
export default function CertificationListScreen() {
  const { items, loading } = useCertifications();

  return (
    <EntryListScreen
      items={items}
      loading={loading}
      describe={(c) => ({
        title: c.name,
        subtitle: c.issuer ?? undefined,
        meta: certDates(c),
      })}
      searchFields={(c) => [c.name, c.issuer, c.credentialId]}
      searchPlaceholder="Name, issuer, or credential ID"
      onAdd={() => router.push('/vault/certifications/form')}
      onEdit={(c) => router.push({ pathname: '/vault/certifications/form', params: { id: String(c.id) } })}
      addLabel="Add Certification"
      empty={{
        icon: 'ribbon-outline',
        title: 'No certifications yet',
        message: 'Add TESDA NCs, online course certificates, seminars, and licenses.',
      }}
    />
  );
}
