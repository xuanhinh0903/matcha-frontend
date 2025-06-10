import Logo from '@/assets/images/icon.png';
import React, { useMemo } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Conversation } from '../../../../../types/message.type';
import { convertToParticipant } from '../../../../../utils/conversation.utils';
import { styles } from '../../../styles';

interface UserAvatarScrollProps {
  conversations: Conversation[];
  currentUserId: number;
  onSelectConversation: (conversation: Conversation) => void;
}

const UserAvatarScroll: React.FC<UserAvatarScrollProps> = ({
  conversations,
  currentUserId,
  onSelectConversation,
}) => {
  // Use sorted conversations to match the main list
  const sortedConversations = useMemo(() => {
    if (!conversations?.length) return [];

    return [...conversations].sort((a, b) => {
      const aHasMessage = !!(a.last_message?.content || a.lastMessage?.content);
      const bHasMessage = !!(b.last_message?.content || b.lastMessage?.content);

      // If one has a message and the other doesn't, prioritize the one with a message
      if (aHasMessage !== bHasMessage) {
        return aHasMessage ? -1 : 1; // Conversations with messages go to top
      }

      // If both have messages or both don't, sort by timestamp
      const aTime =
        a.last_message?.sent_at || a.lastMessage?.sent_at || a.created_at || '';
      const bTime =
        b.last_message?.sent_at || b.lastMessage?.sent_at || b.created_at || '';

      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  }, [conversations]);

  const renderUserAvatar = (conversation: Conversation) => {
    const otherParticipant = conversation.other_user
      ? convertToParticipant(conversation.other_user)
      : conversation.participants?.find((p) => p.user_id !== currentUserId);

    if (!otherParticipant) return null;

    return (
      <TouchableOpacity
        key={conversation.conversation_id}
        onPress={() => onSelectConversation(conversation)}
      >
        <View style={styles.userAvatarContainer}>
          <View style={styles.userAvatarWrapper}>
            <Image
              source={
                otherParticipant.photo_url
                  ? { uri: otherParticipant.photo_url }
                  : Logo
              }
              style={styles.userAvatar}
            />
          </View>
          <Text style={styles.userAvatarName} numberOfLines={1}>
            {otherParticipant.full_name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.avatarScrollContainer}
    >
      {sortedConversations.map((conversation) =>
        renderUserAvatar(conversation)
      )}
    </ScrollView>
  );
};

export default React.memo(UserAvatarScroll);
