import HomePage from '@/features/home';
import { useAppSelector } from '@/store/global';
import { getAuthUser, isUserAdmin } from '@/store/global/auth/auth.slice';
import { useIsFocused } from '@react-navigation/native';
import React from 'react';

export default function Home() {
  const isAdmin = useAppSelector(isUserAdmin);
  const user = useAppSelector(getAuthUser);
  const isFocused = useIsFocused();
  if (!isFocused) {
    return null;
  }
  if (isAdmin || !user) return <></>;
  console.log('Home component rendering for non-admin user:', user);
  return <HomePage />;
}
