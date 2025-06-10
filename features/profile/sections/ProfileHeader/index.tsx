import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { styles } from './styles';

export interface ProfileHeaderProps {
  fullName?: string;
  birthdate?: string;
  profilePicture?: string;
  onEditPress?: () => void;
  onAvatarPress?: () => void;
}

const { width, height } = Dimensions.get('window');

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  fullName,
  birthdate,
  profilePicture,
  onEditPress,
  onAvatarPress,
}) => {
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  const age = useMemo(() => {
    if (!birthdate) return null;
    try {
      const birthDate = new Date(birthdate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (err) {
      console.error('[Age Calculation Error]:', err);
      return null;
    }
  }, [birthdate]);

  const handleAvatarPress = () => {
    if (profilePicture) {
      setAvatarModalVisible(true);
    } else if (onAvatarPress) {
      onAvatarPress();
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={handleAvatarPress}>
          <Image
            source={
              profilePicture
                ? { uri: profilePicture }
                : require('@/assets/images/icon.png')
            }
            style={styles.avatar}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.editButton} onPress={onEditPress}>
          <MaterialCommunityIcons name="pencil" size={18} color="white" />
        </TouchableOpacity>
      </View>
      <Text style={styles.name}>{fullName || 'Set your name'}</Text>
      <Text style={styles.age}>{age ? `${age} years old` : 'Age not set'}</Text>

      {/* Avatar Modal */}
      <Modal
        visible={avatarModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <Image
            source={{ uri: profilePicture }}
            style={styles.modalImage}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setAvatarModalVisible(false)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};
