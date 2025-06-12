import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Slot, useRouter } from 'expo-router';
import { useAppSelector } from '@/store/global';
import { getAuthUser, isUserAdmin } from '@/store/global/auth/auth.slice';

export default function AdminLayout() {
  const user = useAppSelector(getAuthUser);
  const isAdmin = useAppSelector(isUserAdmin);
  
  const router = useRouter();

  useEffect(() => {
    if (!user || !isAdmin) {
      return;
    }
    // Check if user is admin, if not redirect to home
    if (user && !isAdmin) {
      router.replace('/(tabs)');
    } else if (!user) {
      // If user is not logged in, redirect to login
      router.replace('/(auth)/login');
    }
  }, [user, isAdmin, router]);

  return <Slot />;
}
