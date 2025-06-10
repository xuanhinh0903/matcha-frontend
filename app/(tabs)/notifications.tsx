import React from 'react';
import NotificationsScreen from '@/features/notifications';
import { useIsFocused } from '@react-navigation/native';

export default function Notifications() {
  const isFocused = useIsFocused();
  if (!isFocused) {
    return null;
  }
  return <NotificationsScreen />;
}
