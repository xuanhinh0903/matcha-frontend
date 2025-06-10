import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { IDiscoverUser } from '@/types/discover.type';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface LikeUserCardProps {
  user: IDiscoverUser;
  onPress: (userId: string) => void;
  showLikedAt?: boolean;
  whoLikedYou?: boolean;
}

const { width } = Dimensions.get('window');

export const LikeUserCard: React.FC<LikeUserCardProps> = ({
  user,
  onPress,
  showLikedAt = false,
  whoLikedYou,
}) => {
  const profileImage =
    user.photos?.find((photo) => photo.is_profile_picture)?.photo_url ||
    (user.photos && user.photos.length > 0
      ? user.photos[0].photo_url
      : undefined);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(user.user_id.toString())}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <MaterialCommunityIcons name="account" size={40} color="#999" />
          </View>
        )}
        {/* <View
          style={[
            styles.statusIndicator,
            user.is_online ? styles.online : styles.offline,
          ]}
        /> */}
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user.full_name}</Text>
          {/* <Text style={styles.age}>{user.age}</Text> */}
        </View>

        {showLikedAt && user.liked_at && (
          <Text style={styles.likedAt}>
            {whoLikedYou ? 'Liked you ' : 'Liked at '}
            {format(new Date(user.liked_at), 'MMM d, yyyy')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderImage: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderWidth: 2,
    borderColor: 'white',
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#9e9e9e',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  name: {
    fontWeight: '600',
    fontSize: 18,
    color: '#2c3e50',
    marginRight: 8,
  },
  age: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  likedAt: {
    marginTop: 4,
    color: '#666',
    fontSize: 14,
  },
});
