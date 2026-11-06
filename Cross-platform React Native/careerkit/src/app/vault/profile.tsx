import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ProfilePhotoPicker } from '@/components/ProfilePhotoPicker';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { Colors, FontSize, FontWeight } from '@/constants/theme';
import { useProfile } from '@/hooks/useProfile';
import type { Profile, ProfileInput } from '@/types/profile';
import { emptyToNull, validateProfile, type ProfileFormValues } from '@/utils/validators';

const EMPTY_FORM: ProfileFormValues = {
  fullName: '',
  headline: '',
  email: '',
  phone: '',
  address: '',
  summary: '',
  linkedinUrl: '',
  portfolioUrl: '',
};

/** Copies a saved profile into form fields (null becomes an empty string). */
function toFormValues(p: Profile): ProfileFormValues {
  return {
    fullName: p.fullName,
    headline: p.headline ?? '',
    email: p.email ?? '',
    phone: p.phone ?? '',
    address: p.address ?? '',
    summary: p.summary ?? '',
    linkedinUrl: p.linkedinUrl ?? '',
    portfolioUrl: p.portfolioUrl ?? '',
  };
}

/**
 * Edit Profile (FR-V2). The profile is always included at the top of every resume.
 * This outer part only waits for the saved profile to load, then shows the form.
 */
export default function ProfileScreen() {
  const { profile, loading, save, changePhoto, removePhoto } = useProfile();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ProfileForm initial={profile} onSave={save}>
      {/* The photo uses the LIVE profile, so it updates as soon as a new photo is saved. */}
      <ProfilePhotoPicker
        photoPath={profile?.photoUri ?? null}
        onChange={changePhoto}
        onRemove={removePhoto}
      />
    </ProfileForm>
  );
}

type ProfileFormProps = {
  initial: Profile | null;
  onSave: (input: ProfileInput) => Promise<Profile>;
  /** Shown at the top of the form (the profile photo picker). */
  children: ReactNode;
};

function ProfileForm({ initial, onSave, children }: ProfileFormProps) {
  // Starting values are set once, when the form first appears.
  const [values, setValues] = useState<ProfileFormValues>(() =>
    initial ? toFormValues(initial) : EMPTY_FORM
  );
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Errors are recalculated on every keystroke, but only shown after the first Save attempt.
  const errors = validateProfile(values);
  const visibleErrors = submitted ? errors : {};

  /** Returns an onChangeText handler that updates one field. */
  const setField = (field: keyof ProfileFormValues) => (text: string) =>
    setValues((prev) => ({ ...prev, [field]: text }));

  const handleSave = async () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      Alert.alert('Check the form', 'Please fix the highlighted fields.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        fullName: values.fullName.trim(),
        headline: emptyToNull(values.headline),
        email: emptyToNull(values.email),
        phone: emptyToNull(values.phone),
        address: emptyToNull(values.address),
        summary: emptyToNull(values.summary),
        linkedinUrl: emptyToNull(values.linkedinUrl),
        portfolioUrl: emptyToNull(values.portfolioUrl),
      });
      Alert.alert('Saved', 'Your profile has been updated.');
      router.back();
    } catch (e) {
      console.warn('[profile] save failed', e);
      Alert.alert('Could not save', 'Something went wrong while saving your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll>
      <Card>{children}</Card>

      <Card>
        <Text style={styles.section}>Basic info</Text>
        <TextField
          label="Full name"
          required
          placeholder="Juan Dela Cruz"
          value={values.fullName}
          onChangeText={setField('fullName')}
          error={visibleErrors.fullName}
          autoCapitalize="words"
        />
        <TextField
          label="Headline"
          placeholder="BSIT Graduate | Front-End Developer"
          value={values.headline}
          onChangeText={setField('headline')}
        />
      </Card>

      <Card>
        <Text style={styles.section}>Contact</Text>
        <TextField
          label="Email"
          placeholder="juan@email.com"
          value={values.email}
          onChangeText={setField('email')}
          error={visibleErrors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextField
          label="Phone"
          placeholder="0917 123 4567"
          value={values.phone}
          onChangeText={setField('phone')}
          error={visibleErrors.phone}
          keyboardType="phone-pad"
        />
        <TextField
          label="Address"
          placeholder="Quezon City, Metro Manila"
          value={values.address}
          onChangeText={setField('address')}
        />
      </Card>

      <Card>
        <Text style={styles.section}>About you</Text>
        <TextField
          label="Professional summary"
          placeholder="2–3 sentences about your skills and the role you want."
          value={values.summary}
          onChangeText={setField('summary')}
          multiline
        />
      </Card>

      <Card>
        <Text style={styles.section}>Links</Text>
        <TextField
          label="LinkedIn"
          placeholder="linkedin.com/in/juandelacruz"
          value={values.linkedinUrl}
          onChangeText={setField('linkedinUrl')}
          error={visibleErrors.linkedinUrl}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextField
          label="Portfolio / website"
          placeholder="juandelacruz.dev"
          value={values.portfolioUrl}
          onChangeText={setField('portfolioUrl')}
          error={visibleErrors.portfolioUrl}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </Card>

      <Button title="Save profile" icon="checkmark" onPress={handleSave} loading={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  section: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
});
