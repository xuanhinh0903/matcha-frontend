import { StyleSheet, Dimensions } from 'react-native';

// Matcha color palette
export const colors = {
  primary: '#4CAF50', // Main green
  secondary: '#81C784', // Lighter green
  accent: '#2E7D32', // Darker green
  success: '#66BB6A', // Success green
  background: '#E8F5E9', // Very light green
  border: '#A5D6A7', // Medium light green
  text: {
    primary: '#1B5E20', // Dark green for primary text
    secondary: '#388E3C', // Medium green for secondary text
    light: '#C8E6C9', // Light green for text on dark backgrounds
  },
  danger: '#D32F2F', // Red for danger
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    gap: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#fff',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  backButton: {
    marginRight: 16,
  },
  headerAvatar: {
    width: 50, // Slightly larger
    height: 50, // Slightly larger
    borderRadius: 25, // Half of width/height
    borderWidth: 1,
    borderColor: '#F0F0F0', // Subtle border
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  onlineStatus: {
    fontSize: 12,
    color: colors.success,
    marginTop: 2,
  },
  onlineIndicator: {
    width: 14, // Slightly larger
    height: 14, // Slightly larger
    borderRadius: 7,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userAvatarContainer: {
    marginRight: 12,
    alignItems: 'center',
    height: 60,
    justifyContent: 'center',
  },
  userAvatarWrapper: {
    position: 'relative',
    marginBottom: 2,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 18,
  },
  userAvatarName: {
    fontSize: 10,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  avatarScrollContainer: {
    height: 80,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    maxHeight: 80,
  },
  statusIndicatorOnline: {
    backgroundColor: '#2ECC71', // Brighter green for better visibility
  },
  statusIndicatorOffline: {
    backgroundColor: '#BDC3C7', // Lighter gray for softer appearance
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: '#fff',
  },
  searchIcon: {
    marginRight: 8,
    color: colors.text.secondary,
  },
  searchInput: {
    flex: 1,
    height: 36,
    backgroundColor: colors.background,
    borderRadius: 18,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.text.primary,
  },
  listContainer: {
    flex: 1,
  },
  messageInputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    color: colors.text.primary,
    marginRight: 8,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  mediaButton: {
    padding: 10,
    marginRight: 5,
  },
  messageItem: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 12,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 12,
  },
  sentMessageText: {
    color: colors.text.light,
  },
  receivedMessageText: {
    color: colors.text.primary,
  },
  imageMessageBubble: {
    padding: 4, // Less padding for images
    maxWidth: '80%',
  },
  fullImageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  closeFullImageButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  timestampText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  highlightedText: {
    backgroundColor: '#ffe066',
    fontWeight: '500',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f7f0',
    padding: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchQueryContainer: {
    flex: 1,
  },
  searchQueryText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  searchResultsCount: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  clearSearchButton: {
    padding: 4,
    marginLeft: 8,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF', // Lighter border color for cleaner look
    backgroundColor: '#fff',
    alignItems: 'center', // Ensure vertical alignment
  },
  conversationInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center', // Better centered alignment
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '700', // Slightly bolder
    color: '#2C3E50', // Darker, more readable color
    marginBottom: 5, // Adjusted spacing
  },
  lastMessage: {
    fontSize: 14,
    color: '#7F8C8D', // Softer color for secondary text
    opacity: 0.9, // Subtle transparency
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalName: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalInfo: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBio: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 24,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  modalActionText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
  },
  // Message Detail Modal specific styles
  messageModalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  messageModalContent: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backIconContainer: {
    position: 'absolute',
    top: '50%',
    left: SCREEN_WIDTH * 0.3,
    transform: [{ translateY: -20 }],
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    backgroundColor: colors.background,
    borderRadius: 20,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 5,
  },
  // Conversation Item swipe actions
  conversationItemContainer: {
    position: 'relative',
    backgroundColor: '#F9F9F9', // More neutral background
    borderRadius: 8, // Rounded corners
    margin: 4, // Small margin for spacing between items
    overflow: 'hidden', // Ensure content doesn't bleed outside rounded corners
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1, // Subtle elevation for depth
  },
  conversationItemContent: {
    backgroundColor: '#fff',
    zIndex: 1,
    borderRadius: 8, // Match container radius
  },
  conversationItemActions: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 16,
    width: 100,
  },
  actionButton: {
    width: 45, // Larger touch target
    height: 45, // Larger touch target
    borderRadius: 22.5, // Half of width/height
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3, // More pronounced shadow
    shadowRadius: 3,
    elevation: 4, // More pronounced elevation
    marginHorizontal: 6, // Even spacing
  },
  deleteButton: {
    backgroundColor: '#E74C3C', // Brighter red for better visibility
  },
  blockButton: {
    backgroundColor: '#34495E', // Darker, more serious tone
  },
  // Styles for message search with context
  messageGroupContainer: {
    marginVertical: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  contextLabel: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  contextLabelText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  messageGroupSeparator: {
    height: 1,
    backgroundColor: '#eaeaea',
    marginVertical: 10,
  },
  highlightedMessageItem: {
    marginVertical: 6,
  },
  highlightedMessageBubble: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  emptySearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptySearchText: {
    marginTop: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    fontSize: 16,
  },
});
