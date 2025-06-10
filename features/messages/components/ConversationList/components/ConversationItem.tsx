import Logo from '@/assets/images/icon.png';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { Alert, Image, Text, TouchableOpacity, View } from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Conversation } from '../../../../../types/message.type';
import { convertToParticipant } from '../../../../../utils/conversation.utils';
import { styles } from '../../../styles';
import { useConversationActions } from '../hooks';

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: number;
  onPress: () => void;
  isOnline: boolean;
}

const ConversationItem: React.FC<ConversationItemProps> = memo(
  ({ conversation, currentUserId, onPress, isOnline }) => {
    // Get the other participant (not the current user)
    const otherParticipant = conversation.other_user
      ? convertToParticipant(conversation.other_user)
      : conversation.participants?.find((p) => p.user_id !== currentUserId);

    if (!otherParticipant) return null;

    // Animation values for swipe actions
    const translateX = useSharedValue(0);
    const actionsVisible = useSharedValue(false);
    const backdropOpacity = useSharedValue(0);

    // Hooks for conversation actions
    const { handleDeleteConversation, handleBlockUser } =
      useConversationActions();

    // Toggle actions visibility
    const toggleActionsVisibility = () => {
      if (actionsVisible.value) {
        // Hide actions
        translateX.value = withTiming(0, { duration: 200 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        actionsVisible.value = false;
      } else {
        // Show actions
        translateX.value = withTiming(-120, { duration: 200 }); // Wider for better button visibility
        backdropOpacity.value = withTiming(1, { duration: 200 });
        actionsVisible.value = true;
      }
    };

    // Close actions if open
    const closeActionsIfOpen = () => {
      if (actionsVisible.value) {
        translateX.value = withTiming(0, { duration: 200 });
        backdropOpacity.value = withTiming(0, { duration: 200 });
        actionsVisible.value = false;
        return true;
      }
      return false;
    };

    // Handle delete conversation
    const onDelete = () => {
      Alert.alert(
        'Delete Conversation',
        `Are you sure you want to delete your conversation with ${otherParticipant.full_name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              handleDeleteConversation(conversation.conversation_id);
              closeActionsIfOpen();
            },
          },
        ]
      );
    };

    // Handle block user
    const onBlock = () => {
      Alert.alert(
        'Block User',
        `Are you sure you want to block ${otherParticipant.full_name}? You won't be able to receive messages from them.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Block',
            style: 'destructive',
            onPress: () => {
              handleBlockUser(Number(otherParticipant.user_id));
              closeActionsIfOpen();
            },
          },
        ]
      );
    };

    // Gesture handler for real-time swiping
    const gestureHandler = useAnimatedGestureHandler({
      onStart: (_, ctx: any) => {
        ctx.startX = translateX.value;
      },
      onActive: (event, ctx) => {
        // Calculate new position with limits
        const newPosition = ctx.startX + event.translationX;
        // Only allow left swipe (negative values) and limit it to -120
        translateX.value = Math.max(Math.min(newPosition, 0), -120);

        // Update backdrop opacity based on swipe progress
        backdropOpacity.value = Math.min(Math.abs(translateX.value) / 120, 1);
      },
      onEnd: (event) => {
        // Decide whether to snap open or closed based on velocity and position
        if (translateX.value < -40 || event.velocityX < -500) {
          translateX.value = withTiming(-120, { duration: 200 });
          backdropOpacity.value = withTiming(1, { duration: 200 });
          actionsVisible.value = true;
        } else {
          translateX.value = withTiming(0, { duration: 200 });
          backdropOpacity.value = withTiming(0, { duration: 200 });
          actionsVisible.value = false;
        }
      },
    });

    // Animated styles
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: translateX.value }],
      };
    });

    // Backdrop animated style - making it full height with better visibility
    const backdropStyle = useAnimatedStyle(() => {
      return {
        opacity: backdropOpacity.value,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(46, 204, 62, 0.2)', // More visible green background
        borderRadius: 8,
        zIndex: 1,
        height: 'auto',
        width: '100%',
      };
    });

    // Action menu style - positioned at the right side
    const actionMenuStyle = useAnimatedStyle(() => {
      return {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 12, // Add some padding
        zIndex: 1,
        paddingLeft: 12,
        opacity: backdropOpacity.value,
        height: 'auto',
        width: 'auto',
      };
    });

    return (
      <GestureHandlerRootView style={{ overflow: 'hidden', marginVertical: 2 }}>
        <View style={styles.conversationItemContainer}>
          {/* Backdrop overlay */}
          <Animated.View style={backdropStyle} />

          {/* Action buttons positioned on the right */}
          {/* <Animated.View style={actionMenuStyle}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={onDelete}
            >
              <MaterialIcons name="delete" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.blockButton,
                { marginLeft: 8 }, // Add margin between buttons
              ]}
              onPress={onBlock}
            >
              <MaterialCommunityIcons
                name="account-cancel"
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </Animated.View> */}

          <Animated.View
            style={[styles.conversationItemContent, animatedStyle]}
          >
            <TouchableOpacity
              style={styles.conversationItem}
              onPress={() => {
                if (closeActionsIfOpen()) {
                  return;
                }
                onPress();
              }}
            >
              <View style={styles.userAvatarWrapper}>
                <Image
                  source={
                    otherParticipant.photo_url
                      ? { uri: otherParticipant.photo_url }
                      : Logo
                  }
                  style={styles.headerAvatar}
                />
                <View
                  style={[
                    styles.onlineIndicator,
                    isOnline
                      ? styles.statusIndicatorOnline
                      : styles.statusIndicatorOffline,
                  ]}
                />
              </View>
              <View style={styles.conversationInfo}>
                <Text style={styles.conversationName}>
                  {otherParticipant.full_name}
                </Text>
                {(conversation.last_message || conversation.lastMessage) && (
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {conversation.lastMessage?.content_type === 'image' ||
                    conversation.last_message?.content_type === 'image'
                      ? '[Image]'
                      : conversation.lastMessage?.content ||
                        conversation.last_message?.content}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    );
  }
);

export default ConversationItem;
