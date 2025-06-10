import React, { memo, useCallback, useState } from 'react';
import { View } from 'react-native';
import { useSelector } from 'react-redux';
import { useConversations } from '../../../../api/messages';
import { getAuthUser } from '../../../../store/global/auth/auth.slice';
import { Conversation } from '../../../../types/message.type';
import { styles } from '../../styles';
import {
  ConversationHeader,
  ConversationListContent,
  ConversationSearch,
  UserAvatarScroll,
} from './components';
import { useFilteredConversations } from './hooks';
import { useOnlineUsers } from '../../hooks/useOnlineUsers';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  onSelectConversation,
}) => {
  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  console.log('ConversationList rendered');
  // External data
  const { data: conversations, isLoading, refetch } = useConversations();
  const user = useSelector(getAuthUser);
  const { isUserOnline } = useOnlineUsers();

  // Filtered conversations based on search
  const filteredConversations = useFilteredConversations(
    conversations,
    searchQuery,
    user?.id
  );

  // Handlers
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // If no user or still loading, content will be handled by ConversationListContent
  if (!user) return null;

  return (
    <View style={styles.container}>
      {/* Header with "Messages" title */}
      <ConversationHeader />

      {/* Horizontal scroll of user avatars */}
      <UserAvatarScroll
        conversations={filteredConversations}
        currentUserId={user.id}
        onSelectConversation={onSelectConversation}
      />

      {/* Search input */}
      <ConversationSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main conversation list */}
      <ConversationListContent
        conversations={filteredConversations}
        currentUserId={user.id}
        isRefreshing={isRefreshing}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        onSelectConversation={onSelectConversation}
        isUserOnline={isUserOnline}
      />
    </View>
  );
};

const ConversationListMemo = memo(ConversationList);
export { ConversationListMemo as ConversationList };
