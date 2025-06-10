import { useCallback, useEffect, useRef, useState } from 'react';
import { useLazyFindPeopleQuery } from '@/rtk-query';
import { getAuthUser } from '@/store/global/auth/auth.slice';
import { useSelector } from 'react-redux';
import { useTabFocus } from './use-tab-focus';
import { useLocation } from '@/contexts/LocationContext';

export function useDiscoverData(page = 1, limit = 10, autoFetch = false) {
  const user = useSelector(getAuthUser);
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);
  const isTabFocused = useTabFocus();

  // Use the centralized location context instead of managing location separately
  const { userLocation, locationLoading, refreshLocation } = useLocation();

  // API expects lat/lon format
  const [location, setLocation] = useState<{ lat?: number; lon?: number }>({});
  // UI components expect latitude/longitude format
  const [formattedLocation, setFormattedLocation] = useState<{
    latitude?: number;
    longitude?: number;
  }>({});

  // Use lazy query instead of automatic query
  const [trigger, queryResult] = useLazyFindPeopleQuery();

  // Convert locationContext format to the formats we need when userLocation changes
  useEffect(() => {
    if (userLocation && userLocation.length === 2) {
      const [longitude, latitude] = userLocation;

      // Set API format (lat/lon)
      setLocation({
        lat: latitude,
        lon: longitude,
      });

      // Set UI component format (latitude/longitude)
      setFormattedLocation({
        latitude: latitude,
        longitude: longitude,
      });
    }
  }, [userLocation]);

  // Single fetch effect that uses location if available
  useEffect(() => {
    if (isTabFocused && user && !initialLoadAttempted) {
      // If we already have location data, use it right away
      if (userLocation && userLocation.length === 2) {
        const [longitude, latitude] = userLocation;
        console.log('Fetching discover data with location:', {
          lat: latitude,
          lon: longitude,
        });
        trigger({
          page,
          limit,
          lat: latitude,
          lon: longitude,
        }).then(() => {
          setInitialLoadAttempted(true);
        });
      }
      // If location is still loading, wait for it with a timeout
      else if (locationLoading) {
        // Set a timeout to fetch without location if getting location takes too long
        const timeoutId = setTimeout(() => {
          console.log(
            'Location fetch timeout - fetching discover data without location'
          );
          trigger({ page, limit }).then(() => {
            setInitialLoadAttempted(true);
          });
        }, 3000); // 3 second timeout

        return () => clearTimeout(timeoutId);
      }
      // If location failed or is denied, fetch without location
      else {
        console.log('Fetching discover data without location');
        trigger({ page, limit }).then(() => {
          setInitialLoadAttempted(true);
        });
      }
    }
  }, [
    isTabFocused,
    user,
    userLocation,
    locationLoading,
    initialLoadAttempted,
    page,
    limit,
    trigger,
  ]);

  return {
    ...queryResult,
    locationError: null, // Location errors are now managed by LocationContext
    userLocation: location,
    formattedLocation,
    getLocation: refreshLocation, // Use the context's refreshLocation function
    refetch: () => {
      setInitialLoadAttempted(false); // Reset the flag to trigger a new fetch
      if (user) {
        if (userLocation && userLocation.length === 2) {
          const [longitude, latitude] = userLocation;
          console.log('Refetching discover data with location:', {
            lat: latitude,
            lon: longitude,
          });
          return trigger({
            page,
            limit,
            lat: latitude,
            lon: longitude,
          });
        } else {
          console.log('Refetching discover data without location');
          return trigger({ page, limit });
        }
      }
      return Promise.resolve();
    },
  };
}
