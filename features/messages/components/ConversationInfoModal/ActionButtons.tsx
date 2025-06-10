import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Conversation, Participant } from '@/types/message.type';
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { useBlockedUsers, useUnblockUser } from '@/api/user-block';

import { ReportUserModal } from './ReportUserModal';
import { colors } from '../../styles';
import { getReports } from '../../api/getReportsApi';
import { reportUserApi } from '../../api/reportApi';
import { useQuery } from '@tanstack/react-query';
import { ImagePickerAsset } from 'expo-image-picker';

// Matcha theme colors
const matchaColors = {
  primary: colors.primary,
  secondary: '#86A789',
  light: '#D2E3C8',
  border: '#B2C8B2',
  danger: colors.danger,
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  darkText: '#333333',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ActionButtonsProps {
  otherUser: Participant;
  conversation: Conversation;
  onClose: () => void;
  reportUser: (params: any) => Promise<any>;
  isReportingUser: boolean;
  blockUser: (params: any) => Promise<any>;
  isBlockingUser: boolean;
  deleteConversation: (params: any) => Promise<any>;
  isDeletingConversation: boolean;
  reportReason: string | null;
  setReportReason: (reason: string | null) => void;
  onDeleted?: () => void; // <-- add this prop
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  otherUser,
  conversation,
  onClose,
  reportUser,
  isReportingUser,
  blockUser,
  isBlockingUser,
  deleteConversation,
  isDeletingConversation,
  reportReason,
  setReportReason,
  onDeleted, // <-- add here
}) => {
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnmatchModal, setShowUnmatchModal] = useState(false);
  const [isUnmatching, setIsUnmatching] = useState(false);
  //
  const [showReportModal, setShowReportModal] = useState(false);

  // Fetch blocked users
  const { queryKey, queryFn } = useBlockedUsers();
  const { data: blockedUsers = [], refetch } = useQuery({ queryKey, queryFn });
  const isBlocked = blockedUsers.includes(Number(otherUser.user_id));

  // Unblock mutation
  const { mutateAsync: unblockUser, isPending: isUnblockingUser } =
    useUnblockUser('');

  const handleBlockUser = async () => {
    setShowBlockModal(true);
  };

  const confirmBlockUser = async () => {
    try {
      if (isBlocked) {
        await unblockUser({ blockedUserId: Number(otherUser.user_id) });
      } else {
        await blockUser({ blockedUserId: Number(otherUser.user_id) });
      }
      setShowBlockModal(false);
      onClose();
      refetch();
    } catch (error) {
      console.error(
        isBlocked ? 'Failed to unblock user:' : 'Failed to block user:',
        error
      );
      Alert.alert(
        'Error',
        `Failed to ${isBlocked ? 'unblock' : 'block'} user. Please try again.`
      );
    }
  };

  const handleDeleteConversation = async () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteConversation = async () => {
    try {
      await deleteConversation({
        conversationId: conversation.conversation_id,
      });
      setShowDeleteModal(false);
      if (onDeleted) {
        onDeleted(); // <-- call onDeleted if provided
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      Alert.alert('Error', 'Failed to delete conversation. Please try again.');
    }
  };

  const handleUnmatch = () => {
    setShowUnmatchModal(true);
  };

  const confirmUnmatch = async () => {
    try {
      setIsUnmatching(true);

      // // Here we would call the unmatch API
      // // For now, this will simulate unmatch by blocking the user first
      // // and then deleting the conversation
      // await blockUser({ blockedUserId: Number(otherUser.user_id) });
      // await deleteConversation({
      //   conversationId: conversation.conversation_id,
      // });

      setIsUnmatching(false);
      setShowUnmatchModal(false);

      if (onDeleted) {
        onDeleted();
      } else {
        onClose();
      }

      // Show success message
      Alert.alert(
        'Unmatched',
        `You've successfully unmatched with ${otherUser.full_name}.`
      );
    } catch (error) {
      setIsUnmatching(false);
      console.error('Failed to unmatch:', error);
      Alert.alert('Error', 'Failed to unmatch. Please try again.');
    }
  };

  // Xử lý submit report
  const handleSubmitReport = async ({
    reason,
    description,
    files,
  }: {
    reason: string;
    description: string;
    files?: ImagePickerAsset[];
  }) => {
    try {
      // Convert image URIs to file objects expected by the API

      // Create params object according to ReportUserParams interface
      await reportUser({
        reportedUserId: Number(otherUser.user_id),
        reportReason: reason,
        details: description,
        files,
      });

      setShowReportModal(false);
      setReportReason(null);
      Alert.alert('Success', 'User has been reported successfully.');
    } catch (error) {
      console.log('🚀 ~ error:', error);
      setReportReason(null);
      Alert.alert('Error', 'Failed to report user. Please try again.');
    }
  };

  return (
    <>
      {/* Unmatch Button - Big Red Full Width */}
      <View style={styles.unmatchContainer}>
        <TouchableOpacity
          style={styles.unmatchButton}
          onPress={handleUnmatch}
          activeOpacity={0.8}
          testID="unmatch-button"
        >
          <MaterialCommunityIcons
            name="heart-broken"
            size={24}
            color={matchaColors.white}
          />
          <Text style={styles.unmatchButtonText}>
            Unmatch with {otherUser.full_name}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowReportModal(true)}
          disabled={isReportingUser}
          activeOpacity={0.7}
          testID="report-button"
        >
          {isReportingUser && reportReason ? (
            <ActivityIndicator size="small" color={matchaColors.danger} />
          ) : (
            <>
              <Ionicons name="flag" size={24} color={matchaColors.danger} />
              <Text style={styles.actionText}>Report</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleBlockUser}
          disabled={isBlockingUser || isUnblockingUser}
          activeOpacity={0.7}
          testID="block-button"
        >
          <>
            <Ionicons
              name={isBlocked ? 'person-add' : 'person-remove'}
              size={24}
              color={matchaColors.danger}
            />
            <Text style={styles.actionText}>
              {isBlocked ? 'Unblock' : 'Block'}
            </Text>
          </>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDeleteConversation}
          disabled={isDeletingConversation}
          activeOpacity={0.7}
          testID="delete-button"
        >
          <>
            <MaterialIcons
              name="delete"
              size={24}
              color={matchaColors.danger}
            />
            <Text style={styles.actionText}>Delete</Text>
          </>
        </TouchableOpacity>
      </View>

      {/* Report User Modal */}
      <ReportUserModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleSubmitReport}
        isSubmitting={isReportingUser}
        otherUserName={otherUser.full_name}
      />

      {/* Unmatch Modal */}
      <Modal
        visible={showUnmatchModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUnmatchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons
                name="heart-broken"
                size={40}
                color={matchaColors.danger}
              />
              <Text style={styles.modalTitle}>Unmatch</Text>
            </View>

            <Text style={styles.modalDescription}>
              Are you sure you want to unmatch with {otherUser.full_name}? You
              won't be able to interact with each other anymore and this action
              cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowUnmatchModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmUnmatch}
                disabled={isUnmatching}
              >
                {isUnmatching ? (
                  <ActivityIndicator size="small" color={matchaColors.white} />
                ) : (
                  <Text style={styles.confirmButtonText}>Unmatch</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fancy Block User Modal */}
      <Modal
        visible={showBlockModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBlockModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons
                name={
                  isBlocked ? 'person-add-outline' : 'person-remove-outline'
                }
                size={40}
                color={matchaColors.danger}
              />
              <Text style={styles.modalTitle}>
                {isBlocked ? 'Unblock User' : 'Block User'}
              </Text>
            </View>

            <Text style={styles.modalDescription}>
              {isBlocked
                ? `Are you sure you want to unblock ${otherUser.full_name}? You will be able to receive messages from them again.`
                : `Are you sure you want to block ${otherUser.full_name}? You won't be able to receive messages from them.`}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowBlockModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmBlockUser}
                disabled={isBlockingUser || isUnblockingUser}
              >
                {isBlockingUser || isUnblockingUser ? (
                  <ActivityIndicator size="small" color={matchaColors.white} />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    {isBlocked ? 'Unblock' : 'Block'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Fancy Delete Conversation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialIcons
                name="delete-outline"
                size={40}
                color={matchaColors.danger}
              />
              <Text style={styles.modalTitle}>Delete Conversation</Text>
            </View>

            <Text style={styles.modalDescription}>
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmDeleteConversation}
                disabled={isDeletingConversation}
              >
                {isDeletingConversation ? (
                  <ActivityIndicator size="small" color={matchaColors.white} />
                ) : (
                  <Text style={styles.confirmButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  unmatchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: matchaColors.border,
    backgroundColor: matchaColors.white,
  },
  unmatchButton: {
    backgroundColor: matchaColors.danger,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  unmatchButtonText: {
    color: matchaColors.white,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 0,
    marginBottom: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: matchaColors.border,
    backgroundColor: matchaColors.white,
    flexWrap: 'wrap',
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
    minWidth: 80,
  },
  actionText: {
    marginTop: 8,
    color: matchaColors.danger,
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: matchaColors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: matchaColors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: matchaColors.darkText,
    marginTop: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: matchaColors.darkText,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    borderRadius: 8,
    padding: 12,
    minWidth: '45%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    color: matchaColors.darkText,
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: matchaColors.danger,
  },
  confirmButtonText: {
    color: matchaColors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});
