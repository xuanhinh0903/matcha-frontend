import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { useUnlikeUserMutation } from '@/rtk-query';
import { showSuccessToast, showErrorToast } from '@/helpers/toast.helper';

interface UnlikeButtonProps {
  userId: string;
  onComplete: () => void;
  userName?: string;
}

const UnlikeButton: React.FC<UnlikeButtonProps> = ({
  userId,
  onComplete,
  userName = 'this user',
}) => {
  const [unlikeUser] = useUnlikeUserMutation();
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlike = async () => {
    // First close the UI immediately
    onComplete();

    try {
      // Start API request in background
      setIsLoading(true);
      await unlikeUser(userId).unwrap();
      showSuccessToast(`You have unliked ${userName}`);
    } catch (error) {
      console.error('Error unliking user:', error);
      showErrorToast('Failed to unlike user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleUnlike}
        style={styles.button}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Unlike</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#FF5A87',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default UnlikeButton;
