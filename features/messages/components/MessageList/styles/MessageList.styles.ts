import { Platform, StyleSheet } from 'react-native';
import { colors } from '../../../styles';

// Enhanced matcha colors with good text contrast
const matchaColors = {
  primary: '#4CAF50', // Main matcha green
  primaryLight: '#A5D6A7', // Light matcha green
  primaryExtraLight: '#E8F5E9', // Very light matcha green for backgrounds
  primaryDark: '#2E7D32', // Darker matcha green for text on light backgrounds
  secondary: '#81C784', // Secondary matcha green
  accent: '#66BB6A', // Accent matcha green
  text: {
    dark: '#1B5E20', // Dark green for text on light backgrounds
    light: '#FFFFFF', // White for text on dark backgrounds
    gray: '#757575', // Gray for secondary text
  },
  background: {
    light: '#FFFFFF', // White background
    offWhite: '#F9FBF9', // Very slight green tint for contrast
  },
  border: '#C8E6C9', // Light border color
};

export const styles = StyleSheet.create({
  // Modal and container styles
  messageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  messageModalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  messageModalContent: {
    flex: 1,
    backgroundColor: matchaColors.background.light,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  backIconContainer: {
    position: 'absolute',
    left: 0,
    top: 60,
    padding: 10,
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: matchaColors.primaryExtraLight,
  },

  // Header styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: matchaColors.border,
    backgroundColor: matchaColors.background.light,
    paddingTop: Platform.OS === 'android' ? 10 : 50,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    paddingRight: 15,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 17,
    fontWeight: '600',
    color: matchaColors.text.dark,
  },
  onlineStatus: {
    fontSize: 13,
    color: matchaColors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    paddingHorizontal: 10,
  },

  // Search bar styles
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: matchaColors.primaryExtraLight,
    borderBottomWidth: 1,
    borderBottomColor: matchaColors.border,
  },
  searchQueryContainer: {
    flex: 1,
    marginRight: 10,
  },
  searchQueryText: {
    fontSize: 14,
    fontWeight: '500',
    color: matchaColors.text.dark,
    marginBottom: 2,
  },
  searchResultsCount: {
    fontSize: 12,
    color: matchaColors.text.gray,
  },
  clearSearchButton: {
    padding: 5,
  },

  // Message list styles
  listContainer: {
    flex: 1,
  },
  emptySearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    transform: [{ scale: -1 }],
  },
  emptySearchText: {
    marginTop: 10,
    fontSize: 16,
    color: matchaColors.text.gray,
  },

  // Message group styles
  messageGroupContainer: {
    marginVertical: 10,
    marginHorizontal: 10,
    padding: 10,
    backgroundColor: matchaColors.background.offWhite,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: matchaColors.border,
  },
  contextLabel: {
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: matchaColors.border,
  },
  contextLabelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: matchaColors.primaryDark,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  messageGroupSeparator: {
    height: 1,
    backgroundColor: matchaColors.border,
    marginVertical: 15,
  },

  // Message input styles
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: matchaColors.border,
    backgroundColor: matchaColors.background.light,
  },
  mediaButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: matchaColors.primaryExtraLight,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginHorizontal: 8,
    lineHeight: 20,
    color: matchaColors.text.dark,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: matchaColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },

  // Blocked message styles
  blockedMessageContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: matchaColors.background.light,
    borderTopWidth: 1,
    borderTopColor: matchaColors.border,
  },
  blockedMessageText: {
    color: '#D32F2F', // Red for danger/blocked messages
    textAlign: 'center',
    fontWeight: 'bold',
  },
  emptySearchSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 30,
  },

  // Skeleton loader styles
  headerAvatarSkeleton: {
    backgroundColor: matchaColors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerNameSkeleton: {
    height: 16,
    width: 100,
    backgroundColor: matchaColors.border,
    borderRadius: 4,
  },
  messagesLoadingContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  messageSkeletonItem: {
    height: 36,
    marginVertical: 8,
    borderRadius: 18,
    backgroundColor: matchaColors.border,
  },
  messageSkeletonLeft: {
    alignSelf: 'flex-start',
    width: '60%',
    borderBottomLeftRadius: 4,
  },
  messageSkeletonRight: {
    alignSelf: 'flex-end',
    width: '70%',
    borderBottomRightRadius: 4,
  },
  messageInputDisabled: {
    opacity: 0.7,
  },
  inputDisabled: {
    backgroundColor: '#f0f0f0',
    color: '#999',
  },
});

// Re-export colors for components using these styles
export { colors, matchaColors };
