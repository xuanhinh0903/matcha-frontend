import { useEffect, useRef, useState } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { CallStatus } from '../types';
import { Platform } from 'react-native';

export const useCallSound = (
  isActive: boolean,
  callStatus: CallStatus,
  isOutgoing: boolean
) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isSoundLoaded, setIsSoundLoaded] = useState(false);

  // Load sound effects for calls
  useEffect(() => {
    // Don't play sounds if component is not active
    if (!isActive) return;

    let isMounted = true; // Track if component is mounted

    const loadSound = async (status: CallStatus) => {
      // Stop any previous sound playing
      await stopSound();

      if (!isMounted) return; // Don't proceed if component unmounted

      try {
        if (status === 'initiating' || status === 'ringing') {
          // Use correct require statements for the project's existing sound files
          const soundModule = isOutgoing
            ? require('../../../../../assets/sounds/outgoing-call.mp3')
            : require('../../../../../assets/sounds/incoming-call.mp3');

          // Create a sound instance
          const { sound } = await Audio.Sound.createAsync(
            soundModule,
            {
              shouldPlay: true,
              isLooping: true,
              volume: 1.0,
            },
            (status) => {
              if (status.isLoaded) {
                if (isMounted) setIsSoundLoaded(true);
                console.log('[Sound] Sound loaded successfully');
              }
            }
          );

          if (!isMounted) {
            // If component unmounted during load, clean up
            await sound.unloadAsync().catch(() => {});
            return;
          }

          soundRef.current = sound;
          console.log(
            `[Sound] Playing ${isOutgoing ? 'outgoing' : 'incoming'} call sound`
          );
        } else if (status === 'connected') {
          // Only play connected sound if not coming from 'ended'
          if (soundRef.current) {
            // There was a previous sound, which means we're transitioning states
            await stopSound();

            if (!isMounted) return; // Don't proceed if component unmounted

            // Short delay before playing connected sound
            setTimeout(async () => {
              if (!isMounted) return;

              try {
                // Play call connected sound once
                const { sound } = await Audio.Sound.createAsync(
                  require('../../../../../assets/sounds/call-connected.mp3'),
                  {
                    shouldPlay: true,
                    isLooping: false,
                    volume: 0.7,
                  },
                  (status) => {
                    if (status.isLoaded && isMounted) setIsSoundLoaded(true);
                  }
                );

                if (!isMounted) {
                  await sound.unloadAsync().catch(() => {});
                  return;
                }

                // Don't store this in soundRef as it's a one-time sound
                // Just set up cleanup when finished
                sound.setOnPlaybackStatusUpdate(
                  (playbackStatus: AVPlaybackStatus) => {
                    if (
                      playbackStatus.isLoaded &&
                      playbackStatus.didJustFinish
                    ) {
                      sound.unloadAsync().catch(() => {});
                    }
                  }
                );
              } catch (connectedSoundError) {
                console.warn(
                  '[Sound] Error playing connected sound:',
                  connectedSoundError
                );
              }
            }, 300);
          }
        } else {
          // Not a state that requires sound
          await stopSound();
        }
      } catch (error) {
        console.error('[Sound] Error loading sound:', error);
        // Fallback method for sound (vibration)
        if (Platform.OS === 'android') {
          try {
            // Use React Native's Vibration API directly
            const Vibration = require('react-native').Vibration;
            Vibration.vibrate([500, 500, 500]); // Vibrate pattern
          } catch (e) {
            console.log('[Sound] Vibration fallback failed:', e);
          }
        }
      }
    };

    loadSound(callStatus);

    return () => {
      isMounted = false;
      // Make sure to stop sound on unmount
      stopSound();
    };
  }, [isActive, callStatus, isOutgoing]);

  // Function to stop current sound
  const stopSound = async () => {
    try {
      setIsSoundLoaded(false);

      const currentSound = soundRef.current;
      if (!currentSound) {
        return;
      }

      try {
        // Check if the sound is loaded before stopping
        const status = await currentSound.getStatusAsync().catch(() => null);
        if (status && status.isLoaded) {
          await currentSound.stopAsync().catch(() => {});
          await currentSound.unloadAsync().catch(() => {});
        }
      } catch (innerError) {
        // Just silently handle errors during cleanup
      }

      // Always clear the reference
      soundRef.current = null;
    } catch (error) {
      // Reset the sound reference even if there was an error
      soundRef.current = null;
    }
  };

  // Function to play end call sound and stop ringtone
  const handleEndCall = async () => {
    try {
      // First stop any existing ringtone
      await stopSound();

      // Play the end call sound
      const { sound } = await Audio.Sound.createAsync(
        require('../../../../../assets/sounds/call-ended.mp3'),
        { shouldPlay: true, volume: 1.0 },
        (status) => {
          if (status.isLoaded) setIsSoundLoaded(true);
        }
      );

      soundRef.current = sound;

      // Remove reference when sound finishes playing
      sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        // Check if status is a success status and has didJustFinish property
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
          soundRef.current = null;
          setIsSoundLoaded(false);
        }
      });

      // Ensure the sound stops after a timeout even if didJustFinish doesn't trigger
      setTimeout(() => {
        if (soundRef.current === sound) {
          sound.unloadAsync().catch(() => {});
          soundRef.current = null;
          setIsSoundLoaded(false);
        }
      }, 3000); // 3 seconds should be enough for end call sound
    } catch (error) {
      console.error('[Sound] Error playing end call sound:', error);
    }
  };

  return {
    handleEndCall,
    stopSound,
    isSoundLoaded,
  };
};
