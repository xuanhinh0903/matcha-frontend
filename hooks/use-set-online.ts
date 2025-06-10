import { AppState } from 'react-native';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io(`${process.env.EXPO_PUBLIC_API_URL}messages`, {
  autoConnect: false,
  reconnectionAttempts: 10, // Increased from 5 to 10 for better reliability
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000, // Maximum delay between reconnection attempts
  timeout: 10000, // Increased timeout for poor connections
  transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
  forceNew: true,
  query: {
    clientVersion: '1.0', // Usefpul for tracking client versions
    deviceType: 'mobile', // Helps with server-side debugging
  },
});

export const useSetOnline = () => {
  // Inside your component
  useEffect(() => {
    // Function to handle app state changes
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App has come to the foreground
        socket.emit('app_opened');
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App has gone to the background or is inactive
        socket.emit('app_closed');
      }
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    // Set initial online status when component mounts
    socket.emit('app_opened');

    // Clean up
    return () => {
      subscription.remove();
      socket.emit('app_closed');
    };
  }, [socket]);
};
