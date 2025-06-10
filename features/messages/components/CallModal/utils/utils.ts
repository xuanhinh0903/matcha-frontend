import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { CallStatus } from '../types';

export const useCallSound = (
  visible: boolean,
  callStatus: CallStatus,
  isOutgoing: boolean
) => {
  const soundRef = useRef<Audio.Sound | null>(null);

  // Clean up sound resources
  const cleanupSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      } catch (err) {
        console.error('Error cleaning up sound:', err);
      }
    }
  };

  const handleEndCall = async () => {
    try {
      // First disable audio completely at the system level
      await Audio.setIsEnabledAsync(false);

      // Try to stop the current sound if we have a reference
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        } catch (err) {
          console.error('Error stopping sound:', err);
        }
      }

      // Re-enable audio after a brief delay
      setTimeout(async () => {
        await Audio.setIsEnabledAsync(true);
      }, 500);
    } catch (err) {
      console.error('Error handling end call:', err);
    }
  };

  // Handle sound playback based on call status
  useEffect(() => {
    if (!visible) return;

    const loadAndPlaySound = async () => {
      try {
        await cleanupSound();

        // Set audio mode first to ensure proper audio routing
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        let soundSource;
        let shouldLoop = false;

        // Select appropriate sound based on call status and type
        if (callStatus === 'initiating' || callStatus === 'ringing') {
          if (isOutgoing) {
            console.log('Loading outgoing call sound');
            soundSource = require('@/assets/sounds/outgoing-call.mp3');
          } else {
            console.log('Loading incoming call sound');
            soundSource = require('@/assets/sounds/incoming-call.mp3');
          }
          shouldLoop = true;
        } else if (callStatus === 'connected') {
          console.log('Loading connected call sound');
          soundSource = require('@/assets/sounds/call-connected.mp3');
        } else if (callStatus === 'ended') {
          console.log('Loading ended call sound');
          soundSource = require('@/assets/sounds/call-ended.mp3');
        }

        if (soundSource) {
          console.log('Creating sound with loop:', shouldLoop);
          // Load and play the sound with higher volume
          const { sound } = await Audio.Sound.createAsync(soundSource, {
            shouldPlay: true,
            isLooping: shouldLoop,
            volume: 1.0, // Ensure volume is at maximum
            pitchCorrectionQuality: Audio.PitchCorrectionQuality.High,
            shouldCorrectPitch: true,
          });
          soundRef.current = sound;
          console.log('Sound playing successfully');
        }
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    };

    loadAndPlaySound();

    // Cleanup function
    return () => {
      if (soundRef.current) {
        console.log('Cleaning up sound on effect cleanup');
        soundRef.current
          .stopAsync()
          .then(() => {
            soundRef.current?.unloadAsync();
          })
          .catch((err) => console.error('Error stopping sound:', err));
      }
    };
  }, [callStatus, isOutgoing, visible]);

  // Handle visibility changes
  useEffect(() => {
    if (!visible) {
      cleanupSound();
    }

    return () => {
      cleanupSound();
    };
  }, [visible]);

  return { handleEndCall };
};

export const useCallDuration = (
  callStatus: CallStatus,
  initialDuration = 0
) => {
  const [formattedDuration, setFormattedDuration] = useState('00:00');
  const [seconds, setSeconds] = useState(initialDuration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format seconds to MM:SS
  const formatDuration = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  useEffect(() => {
    // Update the initial formatted duration
    setFormattedDuration(formatDuration(initialDuration));
    setSeconds(initialDuration);

    // Start or stop the timer based on call status
    if (callStatus === 'connected') {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Start a new interval to update duration every second
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          const newValue = prev + 1;
          setFormattedDuration(formatDuration(newValue));
          return newValue;
        });
      }, 1000);
    } else {
      // If call is not connected, stop the timer
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [callStatus, initialDuration]);

  // Return the formatted duration string
  return formattedDuration;
};

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

// Call state message
export const getStatusMessage = (
  callStatus: CallStatus,
  isOutgoing: boolean,
  userName: string
) => {
  switch (callStatus) {
    case 'initiating':
      return isOutgoing ? `Calling ${userName}...` : `Incoming call...`;
    case 'ringing':
      return isOutgoing ? `Ringing...` : `${userName} is calling you`;
    case 'connected':
      return 'On call';
    case 'ended':
      return 'Call ended';
    default:
      return '';
  }
};

// Helper function imports needed for animations
import {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
