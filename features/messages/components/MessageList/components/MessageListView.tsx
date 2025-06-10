import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { Message } from '../../../../../types/message.type';
import { MessageWithContext } from '../interfaces';
import { colors, styles } from '../styles/MessageList.styles';
import MessageGroupWithContext from './MessageGroupWithContext';

interface MessageListViewProps {
  isSearchActive: boolean;
  messages: Message[];
  messageGroups: MessageWithContext[];
  isRefreshing: boolean;
  isSearching: boolean;
  handleRefresh: () => void;
  handleLoadMore: () => void;
  renderItem: ({ item }: { item: Message }) => React.ReactElement;
  flatListRef: React.RefObject<FlatList>;
  currentUserId: number;
  searchQuery: string;
}

const MessageListView: React.FC<MessageListViewProps> = ({
  isSearchActive,
  messages,
  messageGroups,
  isRefreshing,
  isSearching,
  handleRefresh,
  handleLoadMore,
  renderItem,
  flatListRef,
  currentUserId,
  searchQuery,
}) => {
  // Empty search results component
  const EmptySearchResults = () => (
    <View style={styles.emptySearchContainer}>
      <Ionicons name="search-outline" size={50} color="#ccc" />
      <Text style={styles.emptySearchText}>No results found</Text>
    </View>
  );

  // Loading search results component
  const LoadingSearchResults = () => (
    <View style={styles.emptySearchContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.emptySearchText}>Searching messages...</Text>
    </View>
  );

  // Empty message list component
  const EmptyMessageList = () => (
    <View style={styles.emptySearchContainer}>
      <Ionicons name="chatbubble-ellipses-outline" size={50} color="#ccc" />
      <Text style={styles.emptySearchText}>No messages yet</Text>
      <Text style={styles.emptySearchSubtext}>
        Start a conversation by writing a message!
      </Text>
    </View>
  );

  return isSearchActive ? (
    // Search results list
    <FlatList
      ref={flatListRef}
      style={styles.listContainer}
      data={messageGroups}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          title="Release to refresh..."
          progressViewOffset={80}
        />
      }
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <MessageGroupWithContext
          messageGroup={item}
          currentUserId={currentUserId}
          searchTerm={searchQuery}
        />
      )}
      ListEmptyComponent={
        isSearching ? <LoadingSearchResults /> : <EmptySearchResults />
      }
    />
  ) : (
    // Regular messages list
    <FlatList
      ref={flatListRef}
      style={styles.listContainer}
      data={messages}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          title="Release to refresh..."
          progressViewOffset={80}
        />
      }
      keyExtractor={(item) => item.message_id.toString()}
      renderItem={renderItem}
      inverted={true}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      contentContainerStyle={{ flexGrow: 1 }}
      ListEmptyComponent={<EmptyMessageList />}
    />
  );
};

export default MessageListView;
