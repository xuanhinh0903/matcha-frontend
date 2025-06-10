import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, styles } from '../styles/MessageList.styles';

interface MessageSearchBarProps {
  searchQuery: string;
  resultsCount: number | undefined;
  isSearching: boolean;
  handleClearSearch: () => void;
}

const MessageSearchBar: React.FC<MessageSearchBarProps> = ({
  searchQuery,
  resultsCount,
  isSearching,
  handleClearSearch,
}) => {
  return (
    <View style={styles.searchBar}>
      <View style={styles.searchQueryContainer}>
        <Text numberOfLines={1} style={styles.searchQueryText}>
          Search: "{searchQuery}"
        </Text>
        <Text style={styles.searchResultsCount}>
          {isSearching ? 'Searching...' : `${resultsCount || 0} results`}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.clearSearchButton}
        onPress={handleClearSearch}
      >
        <Ionicons name="close-circle" size={22} color={colors.text.secondary} />
      </TouchableOpacity>
    </View>
  );
};

export default MessageSearchBar;
