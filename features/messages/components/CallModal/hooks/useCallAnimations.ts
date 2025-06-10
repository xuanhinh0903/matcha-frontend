import { useEffect } from 'react';
import {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { CallStatus } from '../types';

export const useCallAnimations = (visible: boolean, callStatus: CallStatus) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const pulse = useSharedValue(1);

  // Animation for the avatar during ringing
  useEffect(() => {
    if (!visible) return;

    if (callStatus === 'ringing' || callStatus === 'initiating') {
      // Scale animation
      scale.value = withRepeat(
        withTiming(1.15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );

      // Opacity animation
      opacity.value = withRepeat(
        withTiming(0.8, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );

      // Pulse animation for connect/reject buttons
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      cancelAnimation(pulse);
      scale.value = withTiming(1);
      opacity.value = withTiming(1);
      pulse.value = withTiming(1);
    }

    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      cancelAnimation(pulse);
    };
  }, [callStatus, scale, opacity, pulse, visible]);

  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return { avatarStyle, pulseStyle };
};
