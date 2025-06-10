import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Message } from '@/types/message.type';
import { colors } from '../../styles';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';

// Matcha theme colors
const matchaColors = {
  primary: colors.primary,
  secondary: '#86A789',
  light: '#D2E3C8',
  extraLight: '#EBF3E8',
  white: '#FFFFFF',
  textLight: colors.text.secondary,
  text: colors.text.primary,
  border: colors.border,
};

interface SearchResultsTabProps {
  searchResults?: { messages: Message[]; meta?: any };
  isLoading: boolean;
  searchQuery: string;
}

export const SearchResultsTab: React.FC<SearchResultsTabProps> = ({
  searchResults,
  isLoading,
  searchQuery,
}) => {
  // Helper to highlight search terms in message content
  const highlightSearchTerm = (content: string, term: string) => {
    if (!term.trim()) return content;

    const parts = content.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <Text key={i} style={styles.highlightedText}>
          {part}
        </Text>
      ) : (
        part
      )
    );
  };

  const renderEmptyState = () => {
    if (searchQuery.length < 3) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={50} color={matchaColors.light} />
          <Text style={styles.emptyText}>
            Type at least 3 characters to search in this conversation
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={50} color={matchaColors.light} />
        <Text style={styles.emptyText}>
          No results found for "{searchQuery}"
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={matchaColors.primary} />
        <Text style={styles.loadingText}>Searching messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!searchResults?.messages?.length ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={searchResults.messages}
          keyExtractor={(item) => `${item.message_id}`}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.messageItem}>
              <View style={styles.messageHeader}>
                <Text style={styles.senderName}>{item.sender.full_name}</Text>
                <Text style={styles.messageTime}>
                  {format(new Date(item.sent_at), 'MMM d, yyyy h:mm a')}
                </Text>
              </View>
              <View style={styles.messageContent}>
                <Text style={styles.messageText}>
                  {highlightSearchTerm(item.content, searchQuery)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: matchaColors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: matchaColors.textLight,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    color: matchaColors.textLight,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  listContent: {
    padding: 16,
  },
  messageItem: {
    backgroundColor: matchaColors.extraLight,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: matchaColors.primary,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  senderName: {
    fontWeight: 'bold',
    color: matchaColors.primary,
    fontSize: 15,
  },
  messageTime: {
    color: matchaColors.textLight,
    fontSize: 12,
  },
  messageContent: {
    marginTop: 4,
  },
  messageText: {
    fontSize: 15,
    color: matchaColors.text,
    lineHeight: 20,
  },
  highlightedText: {
    backgroundColor: '#ffe066',
    fontWeight: '500',
  },
});
