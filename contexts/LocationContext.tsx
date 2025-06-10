import * as Location from 'expo-location';

import { Alert, Linking } from 'react-native';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface LocationContextType {
  userLocation: [number, number] | null;
  locationLoading: boolean;
  locationError: string | null;
  refreshLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType>({
  userLocation: null,
  locationLoading: true,
  locationError: null,
  refreshLocation: async () => {},
});

export const LocationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [locationLoading, setLocationLoading] = useState<boolean>(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getUserLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);

      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        setLocationLoading(false);
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Store as [longitude, latitude] to match GeoJSON format used in the app
      const coordinates: [number, number] = [
        location.coords.longitude,
        location.coords.latitude,
      ];
      setUserLocation(coordinates);
    } catch (error) {
      Alert.alert(
        'Yêu cầu quyền vị trí',
        'Vui lòng bật quyền truy cập vị trí cho ứng dụng trong phần cài đặt.',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Mở cài đặt', onPress: () => Linking.openSettings() },
        ]
      );
      setLocationError('Failed to get location');
    } finally {
      setLocationLoading(false);
    }
  };

  // Get location when the context is first initialized
  useEffect(() => {
    getUserLocation();
  }, []);

  const refreshLocation = async () => {
    await getUserLocation();
  };

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        locationLoading,
        locationError,
        refreshLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
