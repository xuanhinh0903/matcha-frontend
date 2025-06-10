// VideoChatRoom.tsx
import { useEndAcceptedCall } from '@/api/calls';
import { useSendMessage } from '@/api/messages';
import { getAuthToken } from '@/store/global/auth/auth.slice';
import { callsActions } from '@/store/global/calls';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MediaStream } from 'react-native-webrtc';
import { useDispatch, useSelector } from 'react-redux';
import { useChatConnection } from '../hooks/useChatConnection';
import { usePeerConnection } from '../hooks/usePeerConnection';
import { socket } from '../utils/socket';
import VideoFeed from './VideoFeed';

type ViewMode = 'split' | 'floating';
type CallType = 'video' | 'audio';

interface VideoChatRoomProps {
  localStream: MediaStream;
  remoteUserId?: number;
  remoteUserName?: string;
  remoteUserAvatar?: string;
  callType?: CallType;
  callId?: string;
  conversationId?: number;
  isOutgoing?: boolean;
}

export default function VideoChatRoom({
  localStream,
  callId = 'test_call',
  callType,
  conversationId,
  isOutgoing,
  remoteUserAvatar,
  remoteUserId,
  remoteUserName,
}: VideoChatRoomProps) {
  const localName = 'You';
  const router = useRouter();
  const dispatch = useDispatch();

  const { peerConnection, guestStream, connectionStatus, resetConnection } =
    usePeerConnection(localStream, callId);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [viewMode, setViewMode] = useState<ViewMode>('floating');
  const token = useSelector(getAuthToken);
  const { mutateAsync: endAcceptedCall } = useEndAcceptedCall(token!);
  const { mutateAsync: sendMessage, isPending } = useSendMessage(token || '');

  const [position, setPosition] = useState({ x: 20, y: 20 });

  // Track call duration
  const [callDuration, setCallDuration] = useState(0);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Track if call is connected properly
  const [isCallConnected, setIsCallConnected] = useState(false);

  // Connect to the peer
  useChatConnection(peerConnection, callId);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => viewMode === 'floating',
      onPanResponderMove: (_, gesture) => {
        const x = Math.max(
          0,
          Math.min(Dimensions.get('window').width - 150, gesture.moveX)
        );
        const y = Math.max(
          0,
          Math.min(Dimensions.get('window').height - 150, gesture.moveY)
        );
        setPosition({ x, y });
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  useEffect(() => {
    if (callType === 'audio') {
      localStream?.getVideoTracks().forEach((t) => (t.enabled = false));
      setIsVideoEnabled(false);
    }
  }, [callType, localStream]);

  // Setup call duration tracking when connected
  useEffect(() => {
    if (connectionStatus === 'connected' && !durationTimerRef.current) {
      // Start tracking duration once connected
      setIsCallConnected(true);
      durationTimerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);

      console.log('Started tracking call duration');
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
    };
  }, [connectionStatus]);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);

    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      console.log(`Toggling mute: ${audioTracks.length} audio tracks`);
      audioTracks.forEach((track) => {
        const newEnabled = !isMuted; // If currently muted, enable it and vice versa
        console.log(
          `Setting local audio track ${track.id} enabled=${newEnabled}`
        );
        track.enabled = newEnabled;
      });
    }
  };

  const toggleVideo = () => {
    setIsVideoEnabled((prev) => !prev);

    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  };

  const toggleSpeaker = async () => {
    try {
      const newIsSpeakerOn = !isSpeakerOn;
      console.log(`Toggling speaker: ${newIsSpeakerOn}`);

      await Audio?.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: !newIsSpeakerOn,
      });
      setIsSpeakerOn(newIsSpeakerOn);
    } catch (err) {
      console.warn('Error toggling speaker:', err);
    }
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'split' ? 'floating' : 'split'));
    setPosition({ x: 20, y: 20 });
  };

  // Handle call ending - ensure proper cleanup
  const handleEndCall = useCallback(async () => {
    const currentDuration = callDuration;
    const actualCallDuration = isCallConnected ? currentDuration : 0;

    console.log(
      `Ending call: ${callId}, duration: ${actualCallDuration}s (connected: ${isCallConnected}), type: ${callType}`
    );

    try {
      // Stop duration timer if running
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }

      // First, mark the call as ended in Redux to prevent any race conditions
      dispatch(callsActions.endCall());
      dispatch(callsActions.unregisterActiveCall(callId));

      // Use replace instead of push to avoid navigation stack issues
      if (conversationId) {
        router.replace({
          pathname: '/(message-detail)',
          params: { conversation_id: conversationId },
        });
      } else {
        router.replace('/(tabs)/messages');
      }
    } catch (error) {
      console.error('Failed to end call properly:', error);
      // Fallback navigation in case of error
      router.replace('/(tabs)/messages');
    }
  }, [
    callId,
    callDuration,
    isCallConnected,
    callType,
    conversationId,
    socket,
    router,
    dispatch,
  ]);

  const endCall = useCallback(async () => {
    const currentDuration = callDuration;
    const actualCallDuration = isCallConnected ? currentDuration : 0;

    console.log(
      `Ending call: ${callId}, duration: ${actualCallDuration}s (connected: ${isCallConnected}), type: ${callType}`
    );
    endAcceptedCall({
      callId,
      duration: actualCallDuration,
      conversationId,
      callType: callType || 'audio',
    })
      .then(() => {
        try {
          // Stop duration timer if running
          if (durationTimerRef.current) {
            clearInterval(durationTimerRef.current);
            durationTimerRef.current = null;
          }

          // First, mark the call as ended in Redux to prevent any race conditions
          dispatch(callsActions.endCall());
          dispatch(callsActions.unregisterActiveCall(callId));
          // Notify Socket.io server that we're leaving the room
          socket.emit('leave_room', callId);

          // Close the peer connection
          if (peerConnection) {
            peerConnection.close();
          }

          resetConnection();

          // Use replace instead of push to avoid navigation stack issues
          if (conversationId) {
            router.replace({
              pathname: '/(message-detail)',
              params: { conversation_id: conversationId },
            });
          } else {
            router.replace('/(tabs)/messages');
          }
        } catch (error) {
          console.error('Failed to end call properly:', error);
          // Fallback navigation in case of error
          router.replace('/(tabs)/messages');
        }
      })
      .catch((error) => {
        console.error('Error ending call:', error);
        handleEndCall();
      });
  }, [
    callId,
    callDuration,
    isCallConnected,
    callType,
    conversationId,
    socket,
    router,
    dispatch,
    peerConnection,
    resetConnection,
  ]);

  // Add a cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      // Ensure socket and peer connection are cleaned up if component unmounts unexpectedly
      try {
        if (peerConnection) {
          peerConnection.close();
        }
        // We don't fully clean up the socket here as it might be needed by other parts of the app
      } catch (err) {
        console.warn('Error cleaning up resources on unmount:', err);
      }
    };
  }, [peerConnection]);

  useEffect(() => {
    const handlePeerDisconnected = () => {
      console.log('Peer disconnected, ending call...');
      endCall();
    };

    socket.on('peer_disconnected', handlePeerDisconnected);

    return () => {
      socket.off('peer_disconnected', handlePeerDisconnected);
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Show connected view if we either have a guest stream OR connection is established */}
      {guestStream || connectionStatus === 'connected' ? (
        viewMode === 'split' ? (
          <View style={styles.splitView}>
            {guestStream ? (
              <VideoFeed
                stream={guestStream}
                userName={remoteUserName}
                avatar={remoteUserAvatar}
                isRemote={true} // Added to clarify this is remote stream
                isMuted={false} // Make sure remote audio isn't muted
              />
            ) : (
              // If connected but no guestStream yet, show placeholder
              <View style={styles.waitingForStream}>
                <Text style={styles.waitingText}>Connected</Text>
                <Text style={styles.waitingSubtext}>Waiting for media...</Text>
              </View>
            )}
            <VideoFeed
              stream={localStream}
              isMuted={true} // Local stream should always be muted to prevent echo
              userName={localName}
              isVideoEnabled={isVideoEnabled}
              isLocal={true}
            />
          </View>
        ) : (
          <View style={styles.floatingView}>
            {guestStream ? (
              <VideoFeed
                stream={guestStream}
                userName={remoteUserName}
                avatar={remoteUserAvatar}
                isRemote={true} // Added to clarify this is remote stream
                isMuted={false} // Make sure remote audio isn't muted
                style={styles.fullVideo}
              />
            ) : (
              // If connected but no guestStream yet, show placeholder
              <View style={styles.waitingForStream}>
                <Text style={styles.waitingText}>Connected</Text>
                <Text style={styles.waitingSubtext}>Waiting for media...</Text>
              </View>
            )}
            <View
              {...panResponder.panHandlers}
              style={[
                styles.floatingLocalVideo,
                { left: position.x, top: position.y },
              ]}
            >
              <VideoFeed
                stream={localStream}
                isMuted={true} // Local stream should always be muted to prevent echo
                userName={localName}
                isVideoEnabled={isVideoEnabled}
                isLocal={true}
                style={styles.innerFloating}
              />
            </View>
          </View>
        )
      ) : (
        <View style={styles.callingContainer}>
          <VideoFeed
            stream={localStream}
            isMuted={true} // Local stream should always be muted to prevent echo
            userName={localName}
            isVideoEnabled={isVideoEnabled}
            isFullscreen={true}
            isLocal={true}
            style={styles.fullscreenVideo}
          />
          <View style={styles.callingOverlay}>
            <View style={styles.callerAvatar}>
              {remoteUserAvatar ? (
                <Image
                  source={{ uri: remoteUserAvatar }}
                  style={styles.avatar}
                  defaultSource={require('@/assets/images/icon.png')}
                />
              ) : (
                <View
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: '#ccc',
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                  ]}
                >
                  <Text
                    style={{ fontSize: 24, color: '#fff', fontWeight: 'bold' }}
                  >
                    {remoteUserName?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.callingName}>{remoteUserName}</Text>
            <Text style={styles.callingText}>
              {connectionStatus === 'new'
                ? callType === 'video'
                  ? 'Video calling...'
                  : 'Voice calling...'
                : `${connectionStatus
                    .charAt(0)
                    .toUpperCase()}${connectionStatus.slice(1)}...`}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={toggleMute}
          style={[styles.button, isMuted && styles.active]}
        >
          <Ionicons
            name={isMuted ? 'mic-off-outline' : 'mic-outline'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        {/* Only show video toggle button for video calls */}
        {callType === 'video' && (
          <TouchableOpacity
            onPress={toggleVideo}
            style={[styles.button, !isVideoEnabled && styles.active]}
          >
            <Ionicons
              name={
                isVideoEnabled ? 'videocam-outline' : 'videocam-off-outline'
              }
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={endCall}
          style={[styles.button, styles.endButton]}
        >
          <Ionicons name="call-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleSpeaker}
          style={[styles.button, isSpeakerOn && styles.active]}
        >
          <Ionicons
            name={isSpeakerOn ? 'volume-high-outline' : 'volume-low'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
        {guestStream && callType === 'video' && (
          <TouchableOpacity
            onPress={toggleViewMode}
            style={[styles.button, viewMode === 'floating' && styles.active]}
          >
            <Ionicons
              name={
                viewMode === 'floating' ? 'expand-outline' : 'contract-outline'
              }
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  splitView: { flex: 1, flexDirection: 'column' },
  floatingView: { flex: 1 },
  fullVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  fullscreenVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  floatingLocalVideo: {
    position: 'absolute',
    width: 150,
    height: (150 * 4) / 3,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  innerFloating: { flex: 1 },
  callingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  callingOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
    borderRadius: 20,
  },
  callerAvatar: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  callingName: { fontSize: 24, color: '#fff', marginBottom: 8 },
  callingText: { fontSize: 16, color: '#c0d4a2' },
  waitingForStream: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    margin: 20,
  },
  waitingText: { fontSize: 24, color: '#fff', marginBottom: 8 },
  waitingSubtext: { fontSize: 16, color: '#c0d4a2' },
  controls: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  active: {
    backgroundColor: '#46ec62',
    shadowColor: '#46ec62',
  },
  endButton: {
    backgroundColor: '#ff3b30',
    transform: [{ rotate: '135deg' }],
    width: 66,
    height: 66,
    borderRadius: 33,
  },
});
