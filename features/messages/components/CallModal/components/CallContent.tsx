import React from 'react';
import { Image, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Participant } from '../../../../../types/message.type';
import { styles } from '../styles';
import { CallStatus } from '../types';
import { getStatusMessage } from '../utils';

interface CallContentProps {
  user: Participant;
  callStatus: CallStatus;
  isOutgoing: boolean;
  avatarStyle: any; // Animated style object
  isVideoCall?: boolean;
}

export const CallContent: React.FC<CallContentProps> = ({
  user,
  callStatus,
  isOutgoing,
  avatarStyle,
  isVideoCall = false,
}) => {
  // Avatar background based on call status
  const getAvatarStatusStyle = () => {
    switch (callStatus) {
      case 'connected':
        return styles.connectedAvatarBg;
      case 'ended':
        return styles.endedAvatarBg;
      default:
        return styles.defaultAvatarBg;
    }
  };

  const callTypeText = isVideoCall ? 'Video Call' : 'Voice Call';

  return (
    <View style={styles.contentContainer}>
      <Text style={styles.userName}>{user.full_name}</Text>
      <Text style={styles.statusText}>
        {getStatusMessage(callStatus, isOutgoing, user.full_name)}
      </Text>
      {(callStatus === 'initiating' || callStatus === 'ringing') && (
        <Text style={styles.callTypeText}>{callTypeText}</Text>
      )}

      <Animated.View
        style={[styles.avatarContainer, avatarStyle, getAvatarStatusStyle()]}
      >
        <Image
          source={
            user.photo_url
              ? { uri: user.photo_url }
              : require('@/assets/images/icon.png')
          }
          style={styles.avatar}
        />
      </Animated.View>
    </View>
  );
};
