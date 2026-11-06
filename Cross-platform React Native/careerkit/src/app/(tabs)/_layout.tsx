import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';

import { Colors, FontWeight } from '@/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type TabIconProps = {
  active: IconName;
  inactive: IconName;
  focused: boolean;
  size: number;
};

/** Tab-bar icon: filled + primary color when the tab is active, outline + muted otherwise. */
function TabIcon({ active, inactive, focused, size }: TabIconProps) {
  return (
    <Ionicons
      name={focused ? active : inactive}
      size={size}
      color={focused ? Colors.primary : Colors.mutedText}
    />
  );
}

/**
 * Bottom tabs (Section 8.3): Home, Vault, Requirements, Applications, More.
 * Each file in this (tabs) folder is one tab. The folder name in parentheses is a
 * "route group": it organizes files without adding "/tabs" to the URL.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.onPrimary,
        headerTitleStyle: { fontWeight: FontWeight.semibold },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.mutedText,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.border },
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
