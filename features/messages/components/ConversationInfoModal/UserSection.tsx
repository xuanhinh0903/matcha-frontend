import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Participant } from '@/types/message.type';
import { colors } from '../../styles';

// Matcha theme colors
const matchaColors = {
  primary: colors.primary,
  secondary: '#86A789',
  light: '#D2E3C8',
  extraLight: '#EBF3E8',
  white: '#FFFFFF',
  online: '#4CAF50',
};

interface UserSectionProps {
  user: Participant;
}

export const UserSection: React.FC<UserSectionProps> = ({ user }) => {
  return (
    <View style={styles.userSection}>
      <Image
        source={
          user.photo_url
            ? { uri: user.photo_url }
            : require('@/assets/images/icon.png')
        }
        style={styles.avatar}
      />
      <Text style={styles.userName}>{user.full_name}</Text>
      {user.is_online && (
        <View style={styles.onlineIndicatorContainer}>
          <View style={styles.onlineIndicator} />
          <Text style={styles.onlineText}>Online</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  userSection: {
    alignItems: 'center',
    marginVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: matchaColors.white,
    zIndex: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: matchaColors.light,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: matchaColors.primary,
  },
  onlineIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: matchaColors.online,
    marginRight: 5,
  },
  onlineText: {
    color: matchaColors.online,
    fontSize: 14,
  },
});
