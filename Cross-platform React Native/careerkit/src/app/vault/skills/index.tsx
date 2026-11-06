import { router } from 'expo-router';

import { VaultListScreen } from '@/components/VaultListScreen';
import { skillCategoryLabel, skillLevelLabel } from '@/constants/vault';
import { useSkills } from '@/hooks/useVaultEntries';

/** Skills list: grouped by category, A–Z, search, tap to edit, + to add. */
export default function SkillListScreen() {
  const { items, loading } = useSkills();

  return (
    <VaultListScreen
      items={items}
      loading={loading}
      describe={(s) => ({
        title: s.name,
        subtitle: [skillCategoryLabel(s.category), skillLevelLabel(s.level)].filter(Boolean).join(' · '),
      })}
      searchFields={(s) => [s.name, skillCategoryLabel(s.category)]}
      searchPlaceholder="Skill or category"
      onAdd={() => router.push('/vault/skills/form')}
      onEdit={(s) => router.push({ pathname: '/vault/skills/form', params: { id: String(s.id) } })}
      addLabel="Add Skill"
      empty={{
        icon: 'construct-outline',
        title: 'No skills yet',
        message: 'Add technical skills, soft skills, languages, and tools you use.',
      }}
    />
  );
}
