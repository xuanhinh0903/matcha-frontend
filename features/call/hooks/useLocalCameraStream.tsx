// useLocalCameraStream.ts
import { useEffect, useState } from 'react';
import { mediaDevices, MediaStream } from 'react-native-webrtc';

/**
 * Custom hook to access local camera and microphone stream in Expo React Native.
 *
 * Usage:
 * const { localStream } = useLocalCameraStream();
 *
 * @returns {{ localStream: MediaStream | null }}
 */
export function useLocalCameraStream() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Request access to camera and microphone
    mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (isMounted) {
          setLocalStream(stream as any);
        }
      })
      .catch((error) => {
        console.error('Failed to get local stream:', error);
      });

    // Cleanup on unmount: stop all tracks
    return () => {
      isMounted = false;
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return { localStream };
}
