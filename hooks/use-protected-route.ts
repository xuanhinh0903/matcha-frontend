import { Href, router, useRootNavigationState, useSegments } from 'expo-router';
import { getAuthToken, getAuthUser } from '@/store/global/auth/auth.slice';
import { useEffect, useRef } from 'react';

import { isTokenExpired } from '@/helpers/auth.helper';
import { useSelector } from 'react-redux';

export function useProtectedRoute() {
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const authToken = useSelector(getAuthToken);
  const user = useSelector(getAuthUser);
  const hasNavigatedRef = useRef(false);

  // Memoize inAuthGroup calculation
  const inAuthGroup = segments[0] === '(auth)';
  const inAdminGroup = segments[0] === '(admin)';

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    // Skip if navigation isn't ready or we already navigated in this render cycle
    if (!navigationState?.key || hasNavigatedRef.current) return;

    // Ensure navigation is fully ready before proceeding
    if (!navigationState.stale && navigationState.index !== undefined) {
      // Check authentication status
      const hasValidToken = authToken && !isTokenExpired(authToken);
      const isAuthenticated = hasValidToken && user;

      const navigate = (path: Href) => {
        hasNavigatedRef.current = true;
        // Use setTimeout to push the navigation to the next event cycle
        // This ensures the Root Layout is fully mounted
        setTimeout(() => {
          router.replace(path);
        }, 0);
      };

      // Authentication routing logic in priority order
      if (!isAuthenticated) {
        // Case 1: Not authenticated - send to login unless already there
        if (!inAuthGroup) {
          navigate('/(auth)/login');
        }
      } else {
        // User is authenticated at this point

        // IMPORTANT: Use the actual is_verified flag from the user object
        if (user.is_verified === false) {
          // Case 2: Authenticated but not verified - send to verification page
          navigate('/(auth)/not-verify-account');
        } else if (isAdmin) {
          // Case 3: Verified admin - ensure they're in admin area
          if (!inAdminGroup) {
            navigate('/(admin)');
          }
        } else {
          // Case 4: Verified regular user
          if (inAdminGroup) {
            // Regular users can't access admin routes
            navigate('/(tabs)');
          } else if (inAuthGroup) {
            // No need to stay in auth pages when already authenticated
            navigate('/(tabs)');
          }
        }
      }
    }

    // Reset navigation flag when effect cleanup runs
    return () => {
      hasNavigatedRef.current = false;
    };
  }, [
    navigationState?.key,
    navigationState?.stale,
    navigationState?.index,
    user,
    authToken,
    inAuthGroup,
    inAdminGroup,
    isAdmin,
  ]);

  return {
    isAdmin,
    hasIncompleteProfile: !!user?.is_verified,
  };
}
