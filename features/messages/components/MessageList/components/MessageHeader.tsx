import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Participant } from '../../../../../types/message.type';
import { styles, colors } from '../styles/MessageList.styles';

interface MessageHeaderProps {
  onBack: () => void;
  otherUser: Participant;
  handleCall: () => void;
  handleVideoCall: () => void;
  handleInfoPress: () => void;
  isBlocked: boolean;
  isLoading?: boolean;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({
  onBack,
  otherUser,
  handleCall,
  handleVideoCall,
  handleInfoPress,
  isBlocked,
  isLoading = false,
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        {isLoading ? (
          <View style={[styles.headerAvatar, styles.headerAvatarSkeleton]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <Image
            source={
              otherUser.photo_url
                ? { uri: otherUser.photo_url }
                : require('@/assets/images/icon.png')
            }
            style={styles.headerAvatar}
          />
        )}
        <View style={styles.headerInfo}>
          {isLoading ? (
            <View style={styles.headerNameSkeleton} />
          ) : (
            <>
              <Text style={styles.headerName}>
                {otherUser.full_name || 'Unknown User'}
              </Text>
              {/* {otherUser.is_online && (
                <Text style={styles.onlineStatus}>Online</Text>
              )} */}
            </>
          )}
        </View>
      </View>
      <View style={styles.headerRight}>
        {/* Audio Call Button */}
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleCall}
          disabled={isBlocked || isLoading}
        >
          <Ionicons
            name="call"
            size={24}
            color={isBlocked || isLoading ? '#ccc' : colors.primary}
          />
        </TouchableOpacity>

        {/* Video Call Button */}
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleVideoCall}
          disabled={isBlocked || isLoading}
        >
          <Ionicons
            name="videocam"
            size={24}
            color={isBlocked || isLoading ? '#ccc' : colors.primary}
          />
        </TouchableOpacity>

        {/* Info Button */}
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleInfoPress}
          disabled={isLoading}
          activeOpacity={0.7}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Ionicons
            name="information-circle"
            size={24}
            color={isLoading ? '#ccc' : colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MessageHeader;
