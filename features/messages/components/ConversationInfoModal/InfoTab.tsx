import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Participant } from '@/types/message.type';
import { colors } from '../../styles';
import { useConversationProfile } from '@/api/conversations';
import { useSelector } from 'react-redux';
import { getAuthToken } from '@/store/global/auth/auth.slice';

// Matcha theme colors
const matchaColors = {
  primary: colors.primary,
  secondary: '#86A789',
  light: '#D2E3C8',
  extraLight: '#EBF3E8',
  text: '#2D3F2D',
  textLight: '#5F7161',
  border: '#B2C8B2',
  white: '#FFFFFF',
  online: '#4CAF50',
};

const { width } = Dimensions.get('window');

interface InfoTabProps {
  user: Participant;
  conversationId: number;
}

export const InfoTab: React.FC<InfoTabProps> = ({ user, conversationId }) => {
  const token = useSelector(getAuthToken);
  // Use our new API hook to get full profile with privacy settings
  const {
    data: profile,
    isLoading,
    error,
  } = useConversationProfile(conversationId, Number(user.user_id), token || '');

  const renderEmptyInfo = (message: string) => (
    <View style={styles.emptyContainer}>
      <Ionicons
        name="information-circle-outline"
        size={48}
        color={matchaColors.secondary}
      />
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  const renderProfilePhotos = () => {
    if (
      !profile?.show_photos ||
      !profile.photos ||
      profile.photos.length === 0
    ) {
      return (
        <View style={styles.photoPrivacyContainer}>
          <MaterialCommunityIcons
            name="shield-lock"
            size={50}
            color={matchaColors.secondary}
          />
          <Text style={styles.privacyText}>Photos are private</Text>
        </View>
      );
    }

    // Handle both single and multiple photos
    if (profile.photos.length === 1) {
      // If only one photo, display it in the center
      return (
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: profile.photos[0].photo_url }}
            style={styles.profilePhoto}
            resizeMode="cover"
          />
        </View>
      );
    } else {
      // If multiple photos, display them in a horizontal scroll
      return (
        <View style={styles.photosContainer}>
          <FlatList
            data={profile.photos}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.photo_id.toString()}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item.photo_url }}
                style={styles.photoItem}
                resizeMode="cover"
              />
            )}
            contentContainerStyle={styles.photosList}
          />
        </View>
      );
    }
  };

  const renderInterests = () => {
    if (
      !profile?.show_interests ||
      !profile.interests ||
      profile.interests.length === 0
    ) {
      return null;
    }

    return (
      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>Interests</Text>
        <View style={styles.interestsContainer}>
          {profile.interests.map((interest, index) => (
            <View key={index} style={styles.interestBadge}>
              <Text style={styles.interestText}>{interest}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={matchaColors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Error state
  if (error || !profile) {
    return renderEmptyInfo('Unable to load profile information');
  }

  return (
    <ScrollView
      style={styles.infoContainer}
      contentContainerStyle={styles.infoContentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile photos */}
      {renderProfilePhotos()}

      {/* Age and location section */}
      {profile.show_age && profile.age && (
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Age</Text>
          <Text style={styles.infoText}>{profile.age} years old</Text>
        </View>
      )}

      {/* Bio section */}
      {profile.show_bio && profile.bio ? (
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Bio</Text>
          <Text style={styles.infoText}>{profile.bio}</Text>
        </View>
      ) : !profile.show_bio ? (
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Bio</Text>
          <Text style={styles.privacyText}>Bio is private</Text>
        </View>
      ) : null}

      {/* Interests section */}
      {renderInterests()}

      {/* If there's no visible content at all */}
      {!profile.show_bio &&
        !profile.show_age &&
        !profile.show_photos &&
        !profile.show_interests && (
          <View style={styles.noBioSection}>
            {renderEmptyInfo('This user has made their profile private')}
          </View>
        )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: matchaColors.white,
    zIndex: 1,
  },
  infoContentContainer: {
    paddingBottom: 40,
    backgroundColor: matchaColors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 10,
    color: matchaColors.textLight,
    fontSize: 16,
  },
  photoContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 16,
  },
  photosContainer: {
    width: '100%',
    paddingVertical: 16,
  },
  photosList: {
    paddingHorizontal: 16,
  },
  profilePhoto: {
    width: '90%',
    height: 300,
    borderRadius: 16,
  },
  photoItem: {
    width: width * 0.7,
    height: 300,
    borderRadius: 16,
    marginRight: 10,
  },
  photoPrivacyContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: matchaColors.extraLight,
    margin: 16,
    borderRadius: 16,
  },
  infoSection: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    backgroundColor: matchaColors.extraLight,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: matchaColors.light,
  },
  noBioSection: {
    flex: 1,
    minHeight: 150,
    justifyContent: 'center',
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    color: matchaColors.textLight,
    marginBottom: 8,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 16,
    color: matchaColors.text,
    lineHeight: 22,
  },
  privacyText: {
    fontSize: 16,
    color: matchaColors.textLight,
    marginTop: 10,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: matchaColors.white,
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    color: matchaColors.textLight,
    textAlign: 'center',
    fontSize: 16,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  interestBadge: {
    backgroundColor: matchaColors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: matchaColors.white,
    fontSize: 14,
    fontWeight: '500',
  },
});
