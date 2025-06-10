import { useEffect, useState } from 'react';
import { Audio, InterruptionModeAndroid } from 'expo-av';
import { Platform } from 'react-native';

/**
 * Hook for managing audio settings during calls (Android-focused)
 */
export function useCallAudio() {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  // Configure audio settings on component mount - Android specific
  useEffect(() => {
    const configureAudio = async () => {
      if (Platform.OS !== 'android') return;

      try {
        // Configure audio mode for calls - Android focused
        await Audio.setAudioModeAsync({
          // Don't mix with other audio sessions
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          // Lower other app audio during our call
          shouldDuckAndroid: true,
          // Use earpiece by default, can toggle with speaker button
          playThroughEarpieceAndroid: !isSpeaker,
          staysActiveInBackground: true,
        });
        console.log(`[Audio] Configured for Android: speaker=${isSpeaker}`);
      } catch (error) {
        console.error('[Audio] Error configuring audio mode:', error);
      }
    };

    configureAudio();

    return () => {
      if (Platform.OS !== 'android') return;

      // Reset audio mode when component unmounts
      Audio.setAudioModeAsync({
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,

        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      }).catch((error) =>
        console.error('[Audio] Error resetting audio mode:', error)
      );
    };
  }, [isSpeaker]); // Update when speaker mode changes

  // Toggle mute functionality
  const toggleMute = () => {
    console.log(`[Audio] Toggling mute: ${!isMuted}`);
    setIsMuted(!isMuted);
    // Note: Actual muting happens in the WebRTC stream in the parent component
  };

  // Toggle speaker functionality - Android specific
  const toggleSpeaker = async () => {
    if (Platform.OS !== 'android') return;

    try {
      const newIsSpeaker = !isSpeaker;
      console.log(`[Audio] Toggling speaker: ${newIsSpeaker}`);

      // Update state
      setIsSpeaker(newIsSpeaker);

      // Update audio mode to switch between earpiece and speaker
      await Audio.setAudioModeAsync({
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: !newIsSpeaker, // Toggle between earpiece and speaker
        staysActiveInBackground: true,
      });
    } catch (error) {
      console.error('[Audio] Error toggling speaker:', error);
    }
  };

  return {
    isMuted,
    isSpeaker,
    toggleMute,
    toggleSpeaker,
  };
}
