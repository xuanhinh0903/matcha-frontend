import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  TextInput,
  View,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { styles } from '../../../styles';

interface ConversationSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const ConversationSearch: React.FC<ConversationSearchProps> = ({
  searchQuery,
  setSearchQuery,
}) => {
  // Function to dismiss keyboard when tapping outside search input
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#8e8e8e"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
          returnKeyType="search"
          onSubmitEditing={dismissKeyboard}
          blurOnSubmit={true}
          enablesReturnKeyAutomatically={true}
        />
        {searchQuery ? (
          <TouchableWithoutFeedback onPress={() => setSearchQuery('')}>
            <View>
              <Ionicons name="close-circle" size={18} color="#8e8e8e" />
            </View>
          </TouchableWithoutFeedback>
        ) : null}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default React.memo(ConversationSearch);
