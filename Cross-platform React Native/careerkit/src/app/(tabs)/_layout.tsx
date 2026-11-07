import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, router, Tabs, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandHeaderTitle, HeaderIconButton } from '@/components/AppHeader';
import { Colors, FontWeight, Radius, Spacing } from '@/constants/theme';
import { useOnboardingDone } from '@/hooks/useOnboarding';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** MD3 active indicator size (a pill behind the active tab's icon). */
const INDICATOR_WIDTH = 56;
const INDICATOR_HEIGHT = 30;

type TabIconProps = {
  active: IconName;
  inactive: IconName;
  focused: boolean;
  size: number;
};

/**
 * MD3 navigation bar icon: the active tab gets a filled icon inside a light-teal "pill"
 * (the active indicator); inactive tabs show an outline icon only.
 */
function TabIcon({ active, inactive, focused, size }: TabIconProps) {
  return (
    <View style={[styles.indicator, focused && styles.indicatorActive]}>
      <Ionicons
        name={focused ? active : inactive}
        size={size}
        color={focused ? Colors.onSecondaryContainer : Colors.mutedText}
      />
    </View>
  );
}

/**
 * Bottom tabs (Section 8.3): Home, Vault, Requirements, Applications, More.
 * Each file in this (tabs) folder is one tab. The folder name in parentheses is a
 * "route group": it organizes files without adding "/tabs" to the URL.
 */
export default function TabsLayout() {
  // First launch: show the intro slides before the app (the splash covers this short check).
  const onboardingDone = useOnboardingDone();
  if (onboardingDone === null) return null;
  if (!onboardingDone) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{
        // Header: logo badge + left-aligned title (MD3 top app bar), Settings shortcut on the right.
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
        headerTitleAlign: 'left',
        headerTitle: ({ children }) => <BrandHeaderTitle title={children} />,
        headerRight: () => (
          <HeaderIconButton
            icon="settings-outline"
            label="Settings"
            onPress={() => router.push('/settings' as Href)}
          />
        ),
        tabBarActiveTintColor: Colors.text,
        tabBarInactiveTintColor: Colors.mutedText,
        tabBarLabelStyle: { fontWeight: FontWeight.semibold },
        tabBarStyle: { backgroundColor: Colors.surface, borderTopWidth: 0, elevation: 0 },
        tabBarIconStyle: { width: INDICATOR_WIDTH },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitle: 'CareerKit',
          tabBarIcon: (p) => <TabIcon active="home" inactive="home-outline" focused={p.focused} size={p.size} />,
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: 'Vault',
          headerTitle: 'Career Vault',
          tabBarIcon: (p) => <TabIcon active="briefcase" inactive="briefcase-outline" focused={p.focused} size={p.size} />,
        }}
      />
      <Tabs.Screen
        name="requirements"
        options={{
          title: 'Requirements',
          tabBarIcon: (p) => <TabIcon active="document-text" inactive="document-text-outline" focused={p.focused} size={p.size} />,
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Applications',
          tabBarIcon: (p) => <TabIcon active="paper-plane" inactive="paper-plane-outline" focused={p.focused} size={p.size} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: (p) => <TabIcon active="menu" inactive="menu-outline" focused={p.focused} size={p.size} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  indicator: {
    width: INDICATOR_WIDTH,
    height: INDICATOR_HEIGHT,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs / 2,
  },
  indicatorActive: {
    backgroundColor: Colors.secondaryContainer,
  },
});
