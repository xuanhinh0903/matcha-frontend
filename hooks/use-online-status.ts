import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useSelector } from 'react-redux';
import { getAuthToken, getAuthUser } from '@/store/global/auth/auth.slice';
import { useUpdateOnlineStatus } from '@/api/user-status';

/**
 * Hook to update user's online status when app state changes
 * This will set isOnline=true when app comes to foreground
 * and isOnline=false when app goes to background
 */
export function useOnlineStatus() {
  const token = useSelector(getAuthToken);
  const user = useSelector(getAuthUser);
  const appState = useRef(AppState.currentState);

  // Use React Query mutation for online status updates
  const { mutate: updateOnlineStatus } = useUpdateOnlineStatus();

  useEffect(() => {
    // Only proceed if user is authenticated
    if (!user || !token) {
      return;
    }

    // Set online status to true when component mounts (app is active)
    updateOnlineStatus({ isOnline: true });

    // Handle app state changes
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        console.log(
          `App state changed from ${appState.current} to ${nextAppState}`
        );

        if (
          // App goes to background or inactive
          appState.current === 'active' &&
          (nextAppState === 'background' || nextAppState === 'inactive')
        ) {
          // Update status to offline
          updateOnlineStatus({ isOnline: false });
        } else if (
          // App comes to foreground
          (appState.current === 'background' ||
            appState.current === 'inactive') &&
          nextAppState === 'active'
        ) {
          // Update status to online
          updateOnlineStatus({ isOnline: true });
        }

        // Update our ref to the current state
        appState.current = nextAppState;
      }
    );

    // Cleanup: set offline status when component unmounts
    return () => {
      subscription.remove();
      updateOnlineStatus({ isOnline: false });
    };
  }, [token, user, updateOnlineStatus]);
}
