import { Tabs } from 'expo-router';
import React from 'react';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#BBBBBB',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#FFD6E8',
          height: 62,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: 'Garderobe',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="hanger"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="try-on"
        options={{
          title: 'Anprobieren',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="human-female"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Outfits',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="view-grid-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
