import { useState, useEffect } from 'react';
import { useNavigation } from 'expo-router';

/**
 * Hook that tracks whether the current screen is focused
 * Used to prevent unnecessary API calls when a tab is not visible
 */
export function useTabFocus() {
  const [isFocused, setIsFocused] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    // Set focus when component mounts
    setIsFocused(navigation.isFocused());

    // Subscribe to focus events
    const focusListener = navigation.addListener('focus', () => {
      setIsFocused(true);
    });

    // Subscribe to blur events
    const blurListener = navigation.addListener('blur', () => {
      setIsFocused(false);
    });

    // Cleanup listeners on unmount
    return () => {
      focusListener();
      blurListener();
    };
  }, [navigation]);

  return isFocused;
}
