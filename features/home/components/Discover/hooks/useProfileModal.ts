import { useState, useCallback } from 'react';

export const useProfileModal = () => {
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleOpenProfile = useCallback((userId: string) => {
    setSelectedUserId(userId);
    setProfileModalVisible(true);
  }, []);

  const handleCloseProfile = useCallback(() => {
    setProfileModalVisible(false);
  }, []);

  return {
    profileModalVisible,
    selectedUserId,
    handleOpenProfile,
    handleCloseProfile,
  };
};
