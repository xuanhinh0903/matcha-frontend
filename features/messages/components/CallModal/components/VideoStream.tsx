import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { RTCView, MediaStream } from 'react-native-webrtc';

interface VideoStreamProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  hasLocalStream: boolean;
  hasRemoteStream: boolean;
  userAvatar?: string;
  remoteUserName?: string;
  isOutgoing?: boolean;
}

/**
 * VideoStream component for displaying local and remote video feeds using WebRTC
 */
const VideoStream: React.FC<VideoStreamProps> = ({
  localStream,
  remoteStream,
  hasLocalStream,
  hasRemoteStream,
  userAvatar = 'https://picsum.photos/200',
  remoteUserName = 'Remote User',
  isOutgoing = true,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');

  // Request camera permissions on mount if not using WebRTC streams
  useEffect(() => {
    if (!localStream && hasLocalStream && !permission?.granted) {
      (async () => {
        try {
          await requestPermission();
        } catch (err) {
          console.error('Error requesting camera permissions:', err);
        }
      })();
    }
  }, [hasLocalStream, permission, requestPermission, localStream]);

  // Check if we have camera permission
  const hasPermission = permission?.granted === true;

  // Toggle between front and back camera (only applicable when using camera directly)
  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'front' ? 'back' : 'front'));
  };

  return (
    <View style={styles.container}>
      {/* Remote Video (Full Screen) */}
      {hasRemoteStream && (
        <View style={styles.remoteVideoContainer}>
          {remoteStream ? (
            // Actual remote WebRTC stream - using RTCView correctly
            <RTCView
              streamURL={remoteStream.toURL()}
              style={styles.remoteVideo}
              objectFit="cover"
              mirror={true}
            />
          ) : (
            // Fallback placeholder for remote video
            <View style={styles.remoteVideoPlaceholder}>
              <Image
                source={{ uri: userAvatar }}
                style={styles.remotePlaceholderAvatar}
              />
              <Text style={styles.remotePlaceholderText}>{remoteUserName}</Text>
            </View>
          )}
        </View>
      )}

      {/* Show placeholder if remote video not yet connected */}
      {!hasRemoteStream && (
        <View style={styles.placeholderContainer}>
          <Image
            source={{ uri: userAvatar }}
            style={styles.avatarPlaceholder}
          />
          <Animated.Text style={styles.connectingText}>
            {isOutgoing ? 'Calling...' : 'Incoming video call...'}
          </Animated.Text>
        </View>
      )}

      {/* Local Video (Picture-in-Picture) */}
      {hasLocalStream && (
        <View style={styles.localVideoContainer}>
          {localStream ? (
            // Use actual WebRTC local stream with proper RTCView
            <RTCView
              streamURL={localStream.toURL()}
              style={styles.localCamera}
              objectFit="cover"
              mirror={true}
              zOrder={1}
            />
          ) : hasPermission ? (
            // Fallback to direct camera usage if no WebRTC stream but we have permission
            <CameraView style={styles.localCamera} facing={facing}>
              <TouchableOpacity
                style={styles.flipButton}
                onPress={toggleCameraFacing}
              >
                <Ionicons name="camera-reverse" size={20} color="#fff" />
              </TouchableOpacity>
            </CameraView>
          ) : (
            // Show message if no permission
            <View style={styles.placeholderContainer}>
              <Text style={styles.permissionText}>Camera access required</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
  },
  remoteVideoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#222',
  },
  remoteVideoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  remotePlaceholderAvatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  remotePlaceholderText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  remoteUserInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
  },
  remoteUserName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  localVideoContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#ffffff',
    zIndex: 10,
  },
  localCamera: {
    width: '100%',
    height: '100%',
  },
  flipButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  connectingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  permissionText: {
    color: '#f44336',
    fontSize: 12,
    textAlign: 'center',
    padding: 10,
  },
});

export default VideoStream;
