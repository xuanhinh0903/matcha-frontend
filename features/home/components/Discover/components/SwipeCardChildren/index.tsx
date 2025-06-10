import { Card } from '@/components/ui/Card/matcha-card';
import { IDiscoverUser } from '@/types/discover.type';
import { formatDistance } from '@/utils/location.utils';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Text,
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { computeDistance } from '../../utils';
import { useGetProfileQuery } from '@/rtk-query';
import { useLocation } from '@/contexts/LocationContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const styles = StyleSheet.create({
  infoContainer: {
    padding: 16,
    width: '100%',
    zIndex: 2,
    marginBottom: 80,
  },
  userInfoSection: {
    gap: 12,
  },
  nameAgeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginRight: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  ageText: {
    fontSize: 24,
    color: '#F0F0F0',
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#E0E0E0',
  },
  distanceText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginTop: 2,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300, // Adjust height for proper shadow
    zIndex: 1,
    width: '100%',
  },
});

export interface ISwipeCardChildren {
  item: IDiscoverUser;
  swipe: Animated.ValueXY;
  isFirst: boolean;
  renderChoice: (swipe: Animated.ValueXY) => React.ReactElement;
  onProfilePress: (userId: string) => void;
}

export const SwipeCardChildren = ({
  item,
  swipe,
  isFirst,
  renderChoice,
  onProfilePress,
}: ISwipeCardChildren) => {
  const [city, setCity] = useState<string>('');
  const { userLocation } = useLocation();
  const [distance, setDistance] = useState<number>(0);
  const userPhoto =
    item.photos.find((photo) => photo.is_profile_picture)?.photo_url ||
    item.photos[0]?.photo_url ||
    'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg';

  // Get city name from user location when component mounts
  useEffect(() => {
    if (!userLocation) return;
    const getCityName = async () => {
      if (item.location?.coordinates) {
        try {
          // Ensure coordinates are in the expected format
          let latitude, longitude;

          if (
            Array.isArray(item.location.coordinates) &&
            item.location.coordinates.length >= 2
          ) {
            // GeoJSON format is [longitude, latitude]
            [longitude, latitude] = item.location.coordinates;
          } else if (typeof item.location.coordinates === 'object') {
            // For the case when it's passed as an object like {latitude, longitude}
            // Use type assertion to handle the non-array object case
            const coords = item.location.coordinates as unknown as {
              latitude?: number;
              longitude?: number;
              lat?: number;
              lng?: number;
            };

            latitude = coords.latitude || coords.lat;
            longitude = coords.longitude || coords.lng;
          }

          // Make sure we have valid coordinates before proceeding
          if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            console.log(
              'Invalid coordinates format:',
              item.location.coordinates
            );
            return;
          }

          console.log('SwipeCardChildren', { latitude, longitude });

          // Use the global userLocation instead of fetching from profile
          if (userLocation) {
            const [userLng, userLat] = userLocation;
            setDistance(
              computeDistance([userLng, userLat], [longitude, latitude])
            );
          }

          const result = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });

          console.log('result', result);
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

    getCityName();
  }, [item.location, userLocation]);

  const handlePress = () => {
    onProfilePress(item.user_id.toString());
  };
  const { coordinates } = item.location || {};
  console.log('coordinates', coordinates);
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <Card
        profileImg={userPhoto}
        minWidth={SCREEN_WIDTH - 16}
        minHeight={SCREEN_HEIGHT * 0.7}
        overlayOpacity={0} // Remove default overlay since we're adding our own gradient
      >
        {isFirst && renderChoice(swipe)}

        {/* Add gradient overlay for better text readability */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.85)']}
          style={styles.gradientOverlay}
        />

        <View style={styles.infoContainer}>
          <View style={styles.userInfoSection}>
            <View style={styles.nameAgeContainer}>
              <Text style={styles.nameText}>{item.full_name}</Text>
              <Text style={styles.ageText}>{item.age}</Text>
            </View>

            {item.gender && (
              <View style={styles.locationContainer}>
                <Icon
                  name="person"
                  size={24}
                  color="white"
                  style={styles.locationIcon}
                />
                <Text style={styles.locationText}>
                  {item.gender.charAt(0).toUpperCase() + item.gender.slice(1)}
                </Text>
              </View>
            )}

            <View style={styles.locationContainer}>
              <Icon
                name="location-sharp"
                size={24}
                color="white"
                style={styles.locationIcon}
              />
              <Text style={styles.locationText}>
                {city || 'Unknown location'} • {formatDistance(distance)}
              </Text>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};
