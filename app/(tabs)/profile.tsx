import { ProfileScreen } from '@/features/profile';
import { useIsFocused } from '@react-navigation/native';
import React from 'react';

export default function Profile() {
  const isFocused = useIsFocused();
  if (!isFocused) {
    return null;
  }
  return <ProfileScreen />;
}
