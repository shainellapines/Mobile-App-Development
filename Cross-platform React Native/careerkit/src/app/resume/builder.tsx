import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EntryFormShell } from '@/components/EntryFormShell';
import { FieldHint } from '@/components/FieldHint';
import { ResumeSectionPicker } from '@/components/ResumeSectionPicker';
import { Screen } from '@/components/Screen';
import { Select } from '@/components/Select';
import { TextField } from '@/components/TextField';
import { RESUME_TEMPLATE_HINTS, RESUME_TEMPLATE_OPTIONS, skillCategoryLabel } from '@/constants/vault';
import { useResume } from '@/hooks/useResumes';
import {
  useCertifications,
  useEducationList,
  useExperiences,
  useIdParam,
  useProjects,
  useSkills,
} from '@/hooks/useVaultEntries';
import type { Certification } from '@/types/certification';
import type { Education } from '@/types/education';
import type { Experience } from '@/types/experience';
import type { Project } from '@/types/project';
import type { Resume, ResumeInput, ResumeItemType, ResumeTemplate } from '@/types/resume';
import type { Skill } from '@/types/skill';
import { emptyToNull, validateResume, type ResumeFormValues } from '@/utils/validators';

/** Section order on the resume (FR-R6). */
const SECTION_ORDER: ResumeItemType[] = ['education', 'experience', 'project', 'skill', 'certification'];

type Vault = {
  education: Education[];
  experience: Experience[];
  project: Project[];
  skill: Skill[];
  certification: Certification[];
};

/** Selected ids per section, each list in resume order. */
type Selection = Record<ResumeItemType, number[]>;

/**
 * Starting checkboxes:
 * - editing → exactly what was saved, in the saved order,
 * - new resume → everything checked, so the user only unticks what does not fit the job.
 */
function initialSelection(resume: Resume | null, vault: Vault): Selection {
  const selection = {} as Selection;
  for (const type of SECTION_ORDER) {
    selection[type] = resume
      ? resume.items.filter((i) => i.itemType === type).map((i) => i.itemId)
      : vault[type].map((record) => record.id);
  }
  return selection;
}

/**
 * Resume Builder (FR-R1–R3). /resume/builder = new, /resume/builder?id=3 = edit selection.
 * The outer part loads the resume and all vault entries, then shows the form.
 */
export default function ResumeBuilderScreen() {
  const id = useIdParam();
  const { entry, loading, save } = useResume(id);
  const education = useEducationList();
  const experience = useExperiences();
  const projects = useProjects();
  const skills = useSkills();
  const certifications = useCertifications();

  const vaultLoading =
    education.loading || experience.loading || projects.loading || skills.loading || certifications.loading;
  const isEdit = id !== undefined;

  return (
    <EntryFormShell
      title={isEdit ? 'Edit Resume' : 'New Resume'}
      loading={loading || vaultLoading}
      notFound={isEdit && !entry}>
      <ResumeBuilderForm
        initial={entry}
        isEdit={isEdit}
        vault={{
          education: education.items,
          experience: experience.items,
          project: projects.items,
          skill: skills.items,
          certification: certifications.items,
        }}
        onSave={save}
      />
    </EntryFormShell>
  );
}

type FormProps = {
  initial: Resume | null;
  isEdit: boolean;
  vault: Vault;
  /** Returns the saved resume's id. */
  onSave: (input: ResumeInput) => Promise<number>;
};

function ResumeBuilderForm({ initial, isEdit, vault, onSave }: FormProps) {
  const [values, setValues] = useState<ResumeFormValues>({
    title: initial?.title ?? '',
    targetRole: initial?.targetRole ?? '',
  });
  const [template, setTemplate] = useState<ResumeTemplate>(initial?.template ?? 'ats_simple');
  const [selection, setSelection] = useState<Selection>(() => initialSelection(initial, vault));
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const errors = validateResume(values);
  const visibleErrors = submitted ? errors : {};

  const setSection = (type: ResumeItemType) => (ids: number[]) =>
    setSelection((prev) => ({ ...prev, [type]: ids }));

  const handleSave = async () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      Alert.alert('Check the form', 'Please fix the highlighted fields.');
      return;
    }

    setSaving(true);
    try {
      const resumeId = await onSave({
        title: values.title.trim(),
        targetRole: emptyToNull(values.targetRole),
        template,
        // Flatten the sections in resume order; each keeps its own item order.
        items: SECTION_ORDER.flatMap((type) => selection[type].map((itemId) => ({ itemType: type, itemId }))),
      });
      if (isEdit) {
        router.back(); // back to the preview, which reloads on focus
      } else {
        router.replace({ pathname: '/resume/preview', params: { id: String(resumeId) } });
      }
    } catch (e) {
      console.warn('[resume] save failed', e);
      Alert.alert('Could not save', 'Something went wrong while saving this resume. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <Card>
        <TextField
          label="Resume name"
          required
          placeholder="Front-End Dev – Accenture"
          value={values.title}
          onChangeText={(title) => setValues((v) => ({ ...v, title }))}
          error={visibleErrors.title}
        />
        <TextField
          label="Target role"
          placeholder="Junior Web Developer"
          value={values.targetRole}
          onChangeText={(targetRole) => setValues((v) => ({ ...v, targetRole }))}
        />
        <FieldHint>The target role appears under your name. Leave it empty to use your profile headline.</FieldHint>
        <Select label="Template" options={RESUME_TEMPLATE_OPTIONS} value={template} onChange={setTemplate} />
        <FieldHint>{RESUME_TEMPLATE_HINTS[template]}</FieldHint>
      </Card>

      <Card>
        <FieldHint>
          Your Profile (name, contact details, summary) is always at the top. Tick the entries that fit this job, and
          use ▲ ▼ to put the strongest ones first.
        </FieldHint>
        <Button title="Edit profile" icon="person-outline" variant="secondary" onPress={() => router.push('/vault/profile')} />
      </Card>

      <ResumeSectionPicker
        title="Education"
        items={vault.education}
        selectedIds={selection.education}
        onChange={setSection('education')}
        describe={(e) => ({ label: e.degree, description: e.school })}
      />
      <ResumeSectionPicker
        title="Experience"
        items={vault.experience}
        selectedIds={selection.experience}
        onChange={setSection('experience')}
        describe={(e) => ({ label: e.title, description: e.organization })}
      />
      <ResumeSectionPicker
        title="Projects"
        items={vault.project}
        selectedIds={selection.project}
        onChange={setSection('project')}
        describe={(p) => ({ label: p.name, description: p.role ?? p.techUsed ?? undefined })}
      />
      <ResumeSectionPicker
        title="Skills"
        items={vault.skill}
        selectedIds={selection.skill}
        onChange={setSection('skill')}
        describe={(s) => ({ label: s.name, description: skillCategoryLabel(s.category) })}
      />
      <ResumeSectionPicker
        title="Certifications"
        items={vault.certification}
        selectedIds={selection.certification}
        onChange={setSection('certification')}
        describe={(c) => ({ label: c.name, description: c.issuer ?? undefined })}
      />

      <Button title={isEdit ? 'Save changes' : 'Save & preview'} icon="checkmark" onPress={handleSave} loading={saving} />
    </Screen>
  );
}
