import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FieldHint } from '@/components/FieldHint';
import { LoadingView } from '@/components/LoadingView';
import { Screen } from '@/components/Screen';
import { SectionTitle } from '@/components/SectionTitle';
import { afterModalCloses } from '@/components/SourceChooser';
import { StatusBadge } from '@/components/StatusBadge';
import { Colors, FontSize, StatusColors } from '@/constants/theme';
import { useSettings } from '@/hooks/useSettings';
import { authenticateWithBiometrics } from '@/services/authService';

/** Which reset confirmation is showing: the first, the second ("are you really sure?"), or none. */
type ResetStep = 'first' | 'second' | null;

/** Settings (FR-L1–L3): App Lock, Reset all data, About. */
export default function SettingsScreen() {
  const { state, toggleBiometrics, resetAllData } = useSettings();
  const [resetStep, setResetStep] = useState<ResetStep>(null);
  const [resetting, setResetting] = useState(false);

  if (!state) {
    return (
      <LoadingView />
    );
  }

  const { lockEnabled, biometricsEnabled, biometric, dbInfo } = state;

  /** Turning biometrics ON first asks for a fingerprint/face, to prove it works on this phone. */
  const handleBiometrics = async (enabled: boolean) => {
    try {
      if (enabled && !(await authenticateWithBiometrics())) return;
      await toggleBiometrics(enabled);
    } catch (e) {
      console.warn('[settings] biometrics toggle failed', e);
      Alert.alert('Could not update', 'Something went wrong while changing this setting.');
    }
  };

  const handleReset = () => {
    setResetStep(null);
    afterModalCloses(runReset); // wait for the dialog to close, so the result alert can show on iOS
  };

  const runReset = async () => {
    setResetting(true);
    try {
      await resetAllData();
      Alert.alert('All data deleted', 'CareerKit is now empty, like a fresh install.');
      router.replace('/');
    } catch (e) {
      console.warn('[settings] reset failed', e);
      Alert.alert('Could not reset', 'Something went wrong while deleting your data. Please try again.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <Screen scroll>
      <Card>
        <SectionTitle
          title="App Lock"
          right={
            <StatusBadge
              label={lockEnabled ? 'On' : 'Off'}
              color={lockEnabled ? StatusColors.valid : StatusColors.not_yet_obtained}
            />
          }
        />
        <FieldHint>
          Asks for a PIN when CareerKit opens, and when you come back after 1 minute away.
        </FieldHint>
        {lockEnabled ? (
          <>
            {biometric.available ? (
              <Checkbox
                label={`Unlock with ${biometric.label}`}
                description="Your PIN still works as a backup"
                checked={biometricsEnabled}
                onChange={handleBiometrics}
              />
            ) : (
              <FieldHint>
                {"To unlock with fingerprint or face, set one up in your phone's Settings first."}
              </FieldHint>
            )}
            <Button
              title="Change PIN"
              icon="keypad-outline"
              variant="secondary"
              onPress={() => router.push({ pathname: '/settings/pin', params: { mode: 'change' } })}
            />
            <Button
              title="Turn off App Lock"
              icon="lock-open-outline"
              variant="secondary"
              onPress={() => router.push({ pathname: '/settings/pin', params: { mode: 'disable' } })}
            />
          </>
        ) : (
          <Button
            title="Turn on App Lock"
            icon="lock-closed-outline"
            onPress={() => router.push({ pathname: '/settings/pin', params: { mode: 'set' } })}
          />
        )}
      </Card>

      <Card>
        <SectionTitle title="Data" />
        <FieldHint>
          Deletes your profile, vault, attachments, resumes, requirements, applications, OJT records,
          reminders and PIN from this phone. This cannot be undone.
        </FieldHint>
        <Button
          title="Reset all data"
          icon="trash"
          variant="danger"
          loading={resetting}
          onPress={() => setResetStep('first')}
        />
      </Card>

      <Card>
        <SectionTitle title="About" />
        <Text style={styles.body}>{`CareerKit v${Constants.expoConfig?.version ?? '1.0.0'}`}</Text>
        <Text style={styles.muted}>
          {dbInfo
            ? `Database schema v${dbInfo.schemaVersion} · ${dbInfo.tableCount} tables · foreign keys ${dbInfo.foreignKeysOn ? 'on' : 'off'}`
            : ''}
        </Text>
        <Button
          title="View intro again"
          icon="play-circle-outline"
          variant="secondary"
          onPress={() => router.push({ pathname: '/onboarding', params: { replay: '1' } })}
        />
        <FieldHint>
          Offline and private: no account, no internet, nothing is uploaded. Supports UN SDG 8 — Decent Work
          and Economic Growth.
        </FieldHint>
      </Card>

      {/* FR-L3: double confirmation before deleting everything. */}
      <ConfirmDialog
        visible={resetStep === 'first'}
        title="Reset all data?"
        message="Everything you saved in CareerKit will be deleted from this phone."
        confirmLabel="Continue"
        destructive
        onCancel={() => setResetStep(null)}
        onConfirm={() => setResetStep('second')}
      />
      <ConfirmDialog
        visible={resetStep === 'second'}
        title="Are you really sure?"
        message="This is permanent. There is no backup and no way to get your data back."
        confirmLabel="Delete everything"
        destructive
        onCancel={() => setResetStep(null)}
        onConfirm={handleReset}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  muted: {
    fontSize: FontSize.xs,
    color: Colors.mutedText,
  },
});
