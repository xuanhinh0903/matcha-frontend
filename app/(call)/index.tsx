import VideoChatRoom from '@/features/call/components/VideoChatRoom';
import { useLocalCameraStream } from '@/features/call/hooks/useLocalCameraStream';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet as RNStyleSheet,
  ImageBackground,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

export default function CallRedirect() {
  const { localStream } = useLocalCameraStream();
  const params = useLocalSearchParams();
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  const userName = (params.userName as string) || 'User';
  const userAvatar = (params.userAvatar as string) || '';
  const callType = (params.callType as 'video' | 'audio') || 'video';

  // Fix the isOutgoing parameter parsing to ensure it's correctly interpreted
  // String "true" means it's an outgoing call, everything else means it's incoming
  const isOutgoing = params.isOutgoing === 'true';

  // Debug log to help identify the issue
  useEffect(() => {
    console.log('Call screen params:', {
      userName,
      callType,
      isOutgoing,
      isOutgoingRaw: params.isOutgoing,
      callId: params.callId,
    });
  }, []);

  if (!localStream) return null;

  // Only show the incoming call UI if:
  // 1. This is an incoming call (isOutgoing is false)
  // 2. The call hasn't been accepted yet
  if (!isOutgoing && !accepted) {
    return (
      <ImageBackground
        source={{ uri: userAvatar }}
        style={styles.background}
        blurRadius={2}
        resizeMode="cover"
      >
        {/* gentle overlay for text */}
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'transparent', 'rgba(0,0,0,0.1)']}
          locations={[0, 0.5, 1]}
        />

        {/* Top info bar */}
        <View style={styles.topInfo}>
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.callType}>
            {callType === 'video' ? 'Video Call' : 'Audio Call'}
          </Text>
        </View>

        {/* Center spotlight avatar */}
        <View style={styles.avatarSpotlight}>
          <Image source={{ uri: userAvatar }} style={styles.avatarLarge} />
        </View>

        {/* Bottom controls */}
        <View style={styles.bottomControls}>
          <TouchableOpacity
            onPress={() => router.replace('/(tabs)/messages')}
            style={[styles.controlButton, styles.decline]}
            activeOpacity={0.8}
          >
            <Feather name="x" size={36} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setAccepted(true)}
            style={[styles.controlButton, styles.accept]}
            activeOpacity={0.8}
          >
            <Feather name="phone" size={36} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  // For outgoing calls or accepted incoming calls, show the video chat room
  return (
    <VideoChatRoom
      localStream={localStream}
      callId={params.callId as string}
      callType={callType as 'video' | 'audio'}
      conversationId={+params.conversationId}
      isOutgoing={isOutgoing}
      remoteUserAvatar={userAvatar}
      remoteUserId={Number(params.userId)}
      remoteUserName={userName}
    />
  );
}

const styles = RNStyleSheet.create({
  background: {
    ...RNStyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topInfo: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(156,189,156,0.4)',
    borderRadius: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  callType: {
    fontSize: 14,
    color: '#F0F0F0',
    marginTop: 2,
  },
  avatarSpotlight: {
    padding: 6,
    borderRadius: 90,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(0,0,0,0.2)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  avatarLarge: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    paddingBottom: 40,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  decline: {
    backgroundColor: 'rgba(229,115,115,0.8)',
  },
  accept: {
    backgroundColor: 'rgba(156,189,156,0.8)',
  },
  icon: {
    color: '#FFF',
  },
});
