import React, { useState } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import DiscoverProfileScreen from '..';

interface DiscoverProfileModalProps {
  visible: boolean;
  userId: string | null;
  onClose: () => void;
  isFromLikesSent?: boolean;
  onActionComplete?: (userId: string, action: 'like' | 'dislike') => void;
}

const DiscoverProfileModal: React.FC<DiscoverProfileModalProps> = ({
  visible,
  userId,
  onClose,
  isFromLikesSent = false,
  onActionComplete,
}) => {
  if (!userId) return null;

  // Use the immediate closing pattern for better UX
  const handleClose = () => {
    // Call onClose immediately without waiting for API responses
    onClose();
  };

  // Handle when a like or dislike action occurs
  const handleProfileAction = (action: 'like' | 'dislike') => {
    // Call onClose immediately for responsive UX
    onClose();

    // Notify parent about the action for card removal
    if (onActionComplete && userId) {
      onActionComplete(userId, action);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <DiscoverProfileScreen
          userId={userId}
          onBack={handleClose}
          isFromLikesSent={isFromLikesSent}
          onLikeAction={() => handleProfileAction('like')}
          onDislikeAction={() => handleProfileAction('dislike')}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default DiscoverProfileModal;
