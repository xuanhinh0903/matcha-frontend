import { FlashList } from '@shopify/flash-list';
import React, { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, Text, View } from 'react-native';
import { Conversation } from '../../../../../types/message.type';
import { styles } from '../../../styles';
import ConversationItem from './ConversationItem';

interface ConversationListContentProps {
  conversations: Conversation[];
  currentUserId: number;
  isRefreshing: boolean;
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onSelectConversation: (conversation: Conversation) => void;
  isUserOnline: (userId: number) => boolean;
}

const ConversationListContent: React.FC<ConversationListContentProps> = ({
  conversations,
  currentUserId,
  isRefreshing,
  isLoading,
  onRefresh,
  onSelectConversation,
  isUserOnline,
}) => {
  // Sort conversations by last message timestamp, putting empty messages at the bottom
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

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!conversations?.length) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text>No conversations yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.listContainer}>
      {!sortedConversations?.length && (
        <View
          style={[
            styles.container,
            { justifyContent: 'center', alignItems: 'center' },
          ]}
        >
          <Text>No conversations yet</Text>
        </View>
      )}
      <FlashList
        estimatedItemSize={72}
        data={sortedConversations}
        keyExtractor={(item) => item.conversation_id.toString()}
        renderItem={({ item }) => {
          const otherParticipant = item.other_user
            ? item.other_user
            : item.participants?.find((p) => p.user_id !== currentUserId);

          const isOnline = otherParticipant
            ? isUserOnline(Number(otherParticipant.user_id))
            : false;

          return (
            <ConversationItem
              conversation={item}
              currentUserId={currentUserId}
              onPress={() => onSelectConversation(item)}
              isOnline={isOnline}
            />
          );
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#3bda43"
            title="Pull to refresh..."
          />
        }
      />
    </View>
  );
};

export default React.memo(ConversationListContent);
