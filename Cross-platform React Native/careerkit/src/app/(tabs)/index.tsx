import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Colors, FontSize, FontWeight } from '@/constants/theme';
import { getDbInfo, type DbInfo } from '@/db/repositories/dbInfoRepo';

/**
 * PLACEHOLDER Home tab (step 1.3). Becomes the Dashboard with the
 * Career Readiness Score in step 2.6.
 */
export default function HomeScreen() {
  const db = useSQLiteContext();
  const [dbInfo, setDbInfo] = useState<DbInfo | null>(null);

  // Proves the DB layer (step 1.2) works: reads the schema version and table count.
  useEffect(() => {
    getDbInfo(db)
      .then(setDbInfo)
      .catch((e) => console.warn('[db] could not read DB info', e));
  }, [db]);

  return (
    <Screen scroll edges={['left', 'right']}>
      <Card>
        <Text style={styles.heading}>Welcome to CareerKit</Text>
        <Text style={styles.body}>
          From OJT to employment — store your career once and apply with confidence.
        </Text>
      </Card>

      <Card>
        <Text style={styles.label}>Database status</Text>
        <Text style={styles.body}>
          {dbInfo
            ? `Schema v${dbInfo.schemaVersion} · ${dbInfo.tableCount} tables · foreign keys ${dbInfo.foreignKeysOn ? 'ON' : 'OFF'}`
            : 'Checking…'}
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
  },
  body: {
    fontSize: FontSize.sm,
    color: Colors.mutedText,
  },
});
