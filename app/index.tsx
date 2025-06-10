import { Redirect, useRootNavigationState } from 'expo-router';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getAuthToken, getAuthUser } from '@/store/global/auth/auth.slice';
import { isTokenExpired } from '@/helpers/auth.helper';

export default function App() {
  const rootNavigationState = useRootNavigationState();
  const authToken = useSelector(getAuthToken);
  const user = useSelector(getAuthUser);
  const isAuthenticated = authToken && !isTokenExpired(authToken);
  const isAdmin = user?.role === 'admin';

  // Log only once on mount instead of every render
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        console.log('Admin user detected, redirecting to admin dashboard');
      } else {
        console.log('Regular authenticated user, redirecting to tabs');
      }
    }
  }, [isAuthenticated, isAdmin]);

  if (!rootNavigationState?.key) return null;

  // First time users or non-authenticated users should see onboarding
  if (!isAuthenticated) {
    return <Redirect href={'/(auth)/login'} />;
  }

  // If user is admin, redirect to admin dashboard
  if (isAdmin) {
    return <Redirect href={'/(admin)'} />;
  }

  // Authenticated regular users go directly to tabs
  return <Redirect href={'/(tabs)'} />;
}
