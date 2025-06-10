import { Tabs } from 'expo-router';
import React from 'react';
import {
  DiscoverIcon,
  InboxIcon,
  NotificationIcon,
  ProfileIcon,
} from '@/features/home/icons';
import { useSetOnline } from '@/hooks/use-set-online';

// Optimize tab navigation performance
export default function TabLayout() {
  useSetOnline();
  return (
    <Tabs
      screenOptions={({ route }) => {
        return {
          tabBarActiveTintColor: '#46ec62',
          tabBarInactiveTintColor: '#666',
          tabBarHideOnKeyboard: true,
          freezeOnBlur: true, // Changed to true to freeze screens when not in focus
          tabBarStyle: {
            elevation: 0,
            shadowOpacity: 0, // Reduce rendering complexity
          },
          headerShown: false,
          animation: 'shift',
          unmountOnBlur: false, // Changed to true to unmount screens when not focused
        };
      }}
      initialRouteName="index"
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Discover',
          lazy: true,
          tabBarIcon: ({ color, size }) => (
            <DiscoverIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          headerShown: false,
          title: 'Messages',
          lazy: true, // Changed to true to lazy-load messages
          tabBarIcon: ({ color, size }) => (
            <InboxIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          headerShown: false,
          lazy: true,
          tabBarIcon: ({ color, size }) => (
            <NotificationIcon color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          lazy: true,
          tabBarIcon: ({ color, size }) => (
            <ProfileIcon color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
