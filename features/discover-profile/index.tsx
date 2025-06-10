import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useDiscoverProfile } from './hooks/useDiscoverProfile';
import { useLocalSearchParams, router } from 'expo-router';
import PhotoGallery from './components/PhotoGallery';
import InterestList from './components/InterestList';
import ProfileSkeleton from './components/ProfileSkeleton';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import React, { useCallback, useEffect, useState } from 'react';
import { UserActions } from '@/features/home/components/Discover/components/UserActions';
import * as Location from 'expo-location';
import { formatDistance } from '@/utils/location.utils';
import { showSuccessToast, showErrorToast } from '@/helpers/toast.helper';
import { LikeUserResponse } from '@/rtk-query/likes';
import { useGetProfileQuery } from '@/rtk-query';
import UnlikeButton from './components/UnlikeButton';
import { computeDistance } from '../home/components/Discover/utils';
import { useMatchPopup } from '@/features/match/hooks/useMatchPopup';

const { width, height } = Dimensions.get('window');

interface DiscoverProfileScreenProps {
  userId?: string;
  onBack?: () => void;
  isFromLikesSent?: boolean;
  onLikeAction?: () => void;
  onDislikeAction?: () => void;
}

interface MatchedUserData {
  name: string;
  image: string;
  conversationId?: string;
}

export default function DiscoverProfileScreen({
  userId,
  onBack,
  isFromLikesSent = false,
  onLikeAction,
  onDislikeAction,
}: DiscoverProfileScreenProps = {}) {
  const params = useLocalSearchParams();
  const id = userId || (params.id as string);
  const comingFromLikesSent =
    isFromLikesSent || params.fromLikesSent === 'true';
  const [distance, setDistance] = useState<number>(0);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const { profile, basicProfile, photos, interests, loading } =
    useDiscoverProfile(id);

  const { data: currentUserProfile } = useGetProfileQuery();

  const [city, setCity] = useState<string>('');
  const [isActionLoading, setActionLoading] = useState(false);

  const { showMatch } = useMatchPopup();

  useEffect(() => {
    const getCityName = async () => {
      if (basicProfile?.location?.coordinates) {
        try {
          let latitude, longitude;

          if (
            Array.isArray(basicProfile.location.coordinates) &&
            basicProfile.location.coordinates.length >= 2
          ) {
            [longitude, latitude] = basicProfile.location.coordinates;
          } else if (typeof basicProfile.location.coordinates === 'object') {
            const coords = basicProfile.location.coordinates as unknown as {
              latitude?: number;
              longitude?: number;
              lat?: number;
              lng?: number;
            };

            latitude = coords.latitude || coords.lat;
            longitude = coords.longitude || coords.lng;
          }

          if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            console.log(
              'Invalid coordinates format:',
              basicProfile.location.coordinates
            );
            return;
          }

          const currentUserLocation = currentUserProfile?.location?.coordinates;

          if (currentUserLocation) {
            let userLat, userLng;

            if (
              Array.isArray(currentUserLocation) &&
              currentUserLocation.length >= 2
            ) {
              [userLng, userLat] = currentUserLocation;
            } else if (typeof currentUserLocation === 'object') {
              const userCoords = currentUserLocation as unknown as {
                latitude?: number;
                longitude?: number;
                lat?: number;
                lng?: number;
              };

              userLat = userCoords.latitude || userCoords.lat;
              userLng = userCoords.longitude || userCoords.lng;
            }

            if (typeof userLat === 'number' && typeof userLng === 'number') {
              setDistance(
                computeDistance([userLng, userLat], [longitude, latitude])
              );
            }
          }

          const result = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          if (result && result.length > 0) {
            const location = result[0];
            const cityName =
              location.city ||
              location.district ||
              location.subregion ||
              location.region;
            if (cityName) {
              setCity(
                location.country ? `${cityName}, ${location.country}` : cityName
              );
            }
          }
        } catch (error) {
          console.error('Error getting city:', error);
        }
      }
    };

    if (basicProfile) {
      getCityName();
    }
  }, [basicProfile]);

  const handleLike = useCallback(
    async (matchData?: LikeUserResponse) => {
      try {
        console.log('MATCH DATA RECEIVED:', matchData);

        // More robust match detection - API sometimes returns isMatch: false with status: 'accepted'
        const isActualMatch =
          matchData &&
          (matchData.isMatch === true || matchData.status === 'accepted');

        console.log('IS MATCH DETECTED:', isActualMatch);

        // If we have match data, show the global match popup and close the profile
        if (isActualMatch && matchData) {
          console.log('Match detected, showing global popup');

          // Close the profile screen immediately for better UX
          handleBack();

          // Use global match popup instead of local state
          showMatch(matchData);
          return;
        }

        // For non-match cases or the first call without match data, close immediately
        handleBack();

        // Any background processing or toasts for non-match cases
        if (matchData === undefined) {
          // This is the first call from UserActions - no API result yet
          setActionLoading(true); // Show loading if needed
          // Notify parent about like action if available
          if (onLikeAction) {
            onLikeAction();
          }
        } else {
          // This is a subsequent call with API data but no match
          setActionLoading(false);
          showSuccessToast(
            `You liked ${basicProfile?.full_name || 'this person'}`
          );
        }
      } catch (error) {
        console.error('Error processing like:', error);
        showErrorToast('Failed to like user. Please try again.');
      }
    },
    [handleBack, basicProfile, photos, showMatch, onLikeAction]
  );

  const handleReject = useCallback(() => {
    handleBack();
    // Notify parent about dislike action if available
    if (onDislikeAction) {
      onDislikeAction();
    }
  }, [handleBack, onDislikeAction]);

  if (loading.basicProfile) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Icon name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <ProfileSkeleton type="full" />
      </View>
    );
  }

  if (!basicProfile) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>User not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const mainPhoto =
    photos.find((p) => p.is_profile_picture)?.photo_url ||
    photos[0]?.photo_url ||
    'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg';

  const currentUserImage = currentUserProfile?.profile_thumbnail || '';

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Icon name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        bounces={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        <View style={styles.mainPhotoContainer}>
          <Image source={{ uri: mainPhoto }} style={styles.mainPhoto} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.photoGradient}
          />

          <View style={styles.userInfoOverlay}>
            <Text style={styles.name}>
              {basicProfile.full_name}, {basicProfile.age}
            </Text>

            {basicProfile.gender && (
              <View style={styles.locationContainer}>
                <Icon name="person" size={16} color="#fff" />
                <Text style={styles.location}>
                  {basicProfile.gender.charAt(0).toUpperCase() +
                    basicProfile.gender.slice(1)}
                </Text>
              </View>
            )}

            <View style={styles.locationContainer}>
              <Icon name="location-outline" size={16} color="#fff" />
              <Text style={styles.location}>{city || 'Unknown location'}</Text>
            </View>

            <View style={styles.locationContainer}>
              <Icon name="navigate" size={16} color="#fff" />
              <Text style={styles.location}>{formatDistance(distance)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {basicProfile.bio && (
            <View style={styles.bioContainer}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bio}>{basicProfile.bio}</Text>
            </View>
          )}

          {loading.photos ? (
            <ProfileSkeleton type="photos" />
          ) : (
            <PhotoGallery photos={photos.map((p) => p.photo_url)} />
          )}

          {loading.interests ? (
            <ProfileSkeleton type="interests" />
          ) : (
            <InterestList interests={interests} />
          )}

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>

      {!isActionLoading && (
        <View style={styles.actionsContainer}>
          {comingFromLikesSent ? (
            <UnlikeButton
              userId={String(basicProfile.user_id)}
              onComplete={handleBack}
              userName={basicProfile.full_name}
            />
          ) : (
            <UserActions
              userId={String(basicProfile.user_id)}
              onLike={handleLike}
              onReject={handleReject}
            />
          )}
        </View>
      )}

      {isActionLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  mainPhotoContainer: {
    height: height * 0.6,
    width: width,
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfoOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  name: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  contentContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  onlineDot: {
    backgroundColor: '#000',
  },
  offlineDot: {
    backgroundColor: '#9e9e9e',
  },
  statusText: {
    fontSize: 14,
    color: '#555',
  },
  bioContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#000',
    marginBottom: 16,
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  bottomPadding: {
    height: 100,
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
