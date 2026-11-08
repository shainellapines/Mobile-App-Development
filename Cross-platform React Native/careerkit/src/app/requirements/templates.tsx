import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { FieldHint } from '@/components/FieldHint';
import { LoadingView } from '@/components/LoadingView';
import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/SectionTitle';
import { Select, type SelectOption } from '@/components/Select';
import { REQUIREMENT_TEMPLATES, VALIDITY_DISCLAIMER, type TemplateSet } from '@/constants/requirementTemplates';
import { useRequirementTemplates } from '@/hooks/useRequirementTemplates';
import { useRequirements } from '@/hooks/useRequirements';
import { sameDocumentName, validityLabel } from '@/utils/requirementTemplates';

const SET_OPTIONS: readonly SelectOption<TemplateSet>[] = [
  { value: 'private', label: 'Private company' },
  { value: 'government', label: 'Government' },
  { value: 'abroad', label: 'Abroad / OFW' },
];

/**
 * Smart Templates (FR-Q2): pick a template set, tick the documents you need,
 * and they are added to your list as "Not yet obtained".
 * Documents already in your list are shown but cannot be added twice.
 */
export default function RequirementTemplatesScreen() {
  const { items, loading } = useRequirements();

  if (loading) {
    return (
      <LoadingView />
    );
  }
  return <TemplatePicker existingNames={items.map((r) => r.name)} />;
}

function TemplatePicker({ existingNames }: { existingNames: string[] }) {
  const { addFromTemplate } = useRequirementTemplates();
  const [set, setSet] = useState<TemplateSet>('private');
  const [saving, setSaving] = useState(false);

  const alreadyAdded = (name: string) => existingNames.some((existing) => sameDocumentName(existing, name));
  /** Every document of a set that the user does not have yet: ticked by default. */
  const newNamesOf = (s: TemplateSet) =>
    REQUIREMENT_TEMPLATES[s].map((t) => t.name).filter((name) => !alreadyAdded(name));

  const [selected, setSelected] = useState<string[]>(() => newNamesOf('private'));

  const changeSet = (next: TemplateSet) => {
    setSet(next);
    setSelected(newNamesOf(next)); // start each set with all new documents ticked
  };

  const toggle = (name: string, checked: boolean) =>
    setSelected((prev) => (checked ? [...prev, name] : prev.filter((n) => n !== name)));

  const handleAdd = async () => {
    setSaving(true);
    try {
      const count = await addFromTemplate(selected, set);
      Alert.alert('Added', `${count} requirement${count === 1 ? '' : 's'} added as “Not yet obtained”.`);
      router.back();
    } catch (e) {
      console.warn('[templates] add failed', e);
      Alert.alert('Could not add', 'Something went wrong while adding the requirements. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <Card>
        <Select label="I am applying to a…" options={SET_OPTIONS} value={set} onChange={changeSet} />
        <FieldHint>{VALIDITY_DISCLAIMER}</FieldHint>
      </Card>

      <Card>
        <SectionTitle title="Common documents" />
        {REQUIREMENT_TEMPLATES[set].map((template) => {
          const exists = alreadyAdded(template.name);
          return (
            <Checkbox
              key={template.name}
              label={template.name}
              description={
                exists
                  ? 'Already in your list'
                  : template.defaultValidityMonths
                    ? `Usually valid for ${validityLabel(template.defaultValidityMonths)}`
                    : 'Usually does not expire'
              }
              checked={exists || selected.includes(template.name)}
              disabled={exists}
              onChange={(checked) => toggle(template.name, checked)}
            />
          );
        })}
      </Card>

      <Button
        title={selected.length > 0 ? `Add ${selected.length} requirement${selected.length === 1 ? '' : 's'}` : 'Nothing selected'}
        icon="add"
        onPress={handleAdd}
        loading={saving}
        disabled={selected.length === 0}
      />
      <FieldHint>You can still add your own documents with the + button on the Requirements tab.</FieldHint>
    </Screen>
  );
}

