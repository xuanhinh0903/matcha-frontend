import * as Location from 'expo-location';
import { ILocation } from '@/types/user.type';

/**
 * Format distance for display
 * @param distance Distance in kilometers
 * @returns Formatted distance string
 */
export const formatDistance = (distance: number | null | undefined): string => {
  if (distance === null || distance === undefined) {
    return 'Unknown distance';
  }

  if (distance < 1) {
    return 'Less than 1 km away';
  }

  return `${Math.round(distance)} km away`;
};

/**
 * Get city name from coordinates using Expo Location
 * @param coordinates Location coordinates [longitude, latitude]
 * @returns Promise with city name or fallback text
 */
export const getCityFromCoordinates = async (
  coordinates: [number, number] | undefined
): Promise<string> => {
  if (!coordinates) {
    return 'Unknown location';
  }

  try {
    // Expo Location expects [latitude, longitude] order for reverse geocoding
    const [longitude, latitude] = coordinates;

    // Get location details from coordinates
    const geoCodeResults = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    // Extract city information
    if (geoCodeResults && geoCodeResults.length > 0) {
      const location = geoCodeResults[0];

      // Try different fields to get the most specific location name
      const city =
        location.city ||
        location.district ||
        location.subregion ||
        location.region;

      if (city && location.country) {
        return `${city}, ${location.country}`;
      } else if (city) {
        return city;
      } else if (location.country) {
        return location.country;
      }
    }

    return 'Unknown location';
  } catch (error) {
    console.error('Error getting city from coordinates:', error);
    return 'Unknown location';
  }
};

/**
 * Format a GeoJSON location object to a readable string
 * @param location GeoJSON location object
 * @returns Simple coordinates string or 'Unknown location'
 */
export const formatCoordinates = (
  location: ILocation | null | undefined
): string => {
  if (!location || !location.coordinates) {
    return 'Unknown location';
  }

  const [longitude, latitude] = location.coordinates;
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
};
