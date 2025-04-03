import React from 'react';
import { Tabs } from 'expo-router';
import { colors } from '@/constants/colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerStyle: {
          backgroundColor: colors.white,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.text,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <FontAwesome name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="temperature"
        options={{
          title: 'Temperature',
          tabBarIcon: ({ color, size }) => <FontAwesome name="thermometer" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="checklists"
        options={{
          title: 'Checklists',
          tabBarIcon: ({ color, size }) => <FontAwesome name="list-alt" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cooling"
        options={{
          title: 'Cooling',
          tabBarIcon: ({ color, size }) => <FontAwesome name="snowflake-o" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sanitation"
        options={{
          title: 'Sanitation',
          tabBarIcon: ({ color, size }) => <FontAwesome name="check-square-o" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="haccp"
        options={{
          title: 'HACCP',
          tabBarIcon: ({ color, size }) => <FontAwesome name="shield" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="export"
        options={{
          title: 'Export',
          tabBarIcon: ({ color, size }) => <FontAwesome name="download" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => <FontAwesome name="exclamation-triangle" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}