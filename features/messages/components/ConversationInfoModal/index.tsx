import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Conversation } from '@/types/message.type';
import { useConversationMedia, useDeleteConversation } from '@/api/messages';
import { useReportUser } from '@/api/messages';
import { useBlockUser } from '@/api/user-block';
import { getAuthToken } from '@/store/global/auth/auth.slice';
import { colors } from '../../styles';

// Import the components
import { TabNavigation } from './TabNavigation';
import { UserSection } from './UserSection';
import { InfoTab } from './InfoTab';
import { MediaTab } from './MediaTab';
import { ActionButtons } from './ActionButtons';

// Matcha theme colors
const matchaColors = {
  primary: colors.primary,
  border: '#B2C8B2',
  white: '#FFFFFF',
};

interface ConversationInfoModalProps {
  visible: boolean;
  onClose: () => void;
  conversation: Conversation;
  otherUser: any;
  onDelete?: () => void;
  onSearch?: (query: string) => void;
}
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ConversationInfoModal: React.FC<ConversationInfoModalProps> = ({
  visible,
  onClose,
  conversation,
  otherUser,
  onDelete,
  onSearch,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'media'>('info');
  const [reportReason, setReportReason] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const token = useSelector(getAuthToken);

  const { mutateAsync: blockUser, isPending: isBlockingUser } = useBlockUser(
    token || ''
  );
  const { mutateAsync: deleteConversation, isPending: isDeletingConversation } =
    useDeleteConversation(token || '');
  const { mutateAsync: reportUser, isPending: isReportingUser } =
    useReportUser();

  const { data: mediaData, isLoading: isLoadingMedia } = useConversationMedia({
    conversationId: conversation.conversation_id,
    limit: 20,
    page: 1,
  });

  const handleBackPress = () => {
    onClose();
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0 && onSearch) {
      console.log('Submitting search query:', searchQuery.trim());
      onSearch(searchQuery.trim());
      onClose();
    }
  };

  // Render the active tab content
  const renderTabContent = () => {
    if (activeTab === 'info') {
      return (
        <InfoTab
          user={otherUser}
          conversationId={conversation.conversation_id}
        />
      );
    } else {
      return <MediaTab mediaData={mediaData} isLoading={isLoadingMedia} />;
    }
  };

  return (
    <View>
      <Modal
        visible={visible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleBackPress}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backButton}
            >
              <View style={styles.backButtonInner}>
                <Ionicons
                  name="arrow-back"
                  size={28}
                  color={matchaColors.primary}
                />
              </View>
            </TouchableOpacity>
            <Text style={styles.title}>Conversation Info</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* User Profile Section */}
          <UserSection user={otherUser} />

          {/* Search Box */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#8e8e8e"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search in conversation..."
              value={searchQuery}
              onChangeText={handleSearch}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.trim().length > 0 && (
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearchSubmit}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="arrow-forward"
                  size={22}
                  color={matchaColors.primary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Tab Navigation */}
          <TabNavigation
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
          />

          {/* Tab Content */}
          <View style={styles.tabContentContainer}>{renderTabContent()}</View>

          {/* Action Buttons */}
          <ActionButtons
            otherUser={otherUser}
            conversation={conversation}
            onClose={onClose}
            reportUser={reportUser}
            isReportingUser={isReportingUser}
            blockUser={blockUser}
            isBlockingUser={isBlockingUser}
            deleteConversation={deleteConversation}
            isDeletingConversation={isDeletingConversation}
            reportReason={reportReason}
            setReportReason={setReportReason}
            onDeleted={() => {
              onClose(); // close modal
              if (onDelete) onDelete();
            }}
          />
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: matchaColors.white,
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: matchaColors.border,
    backgroundColor: matchaColors.white,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: matchaColors.primary,
  },
  backButton: {
    padding: 12,
    borderRadius: 20,
  },
  backButtonInner: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    margin: 16,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    padding: 8,
  },
  tabContentContainer: {
    flex: 1,
    minHeight: SCREEN_HEIGHT * 0.5, // Ensure enough space for content
  },
});
