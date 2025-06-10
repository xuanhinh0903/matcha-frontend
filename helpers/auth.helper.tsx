import { jwtDecode } from 'jwt-decode';
import { router } from 'expo-router';
import { type TPayloadToken } from '@/store/global/auth/auth.slice';
import { store } from '@/store/global';
import { authActions } from '@/store/global/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { client } from '../api/common/client';

// Token refresh utility to ensure sockets and API use the same token
export const getLatestToken = async (): Promise<string> => {
  try {
    // First try to get the token from AsyncStorage (most recent)
    const token = await AsyncStorage.getItem('accessToken');

    if (!token) {
      throw new Error('No token found in storage');
    }

    // Update the auth header for all future API requests
    client.defaults.headers.common.Authorization = `Bearer ${token}`;

    return token;
  } catch (error) {
    console.error('Failed to get latest token:', error);
    // Don't redirect to login automatically - just throw the error
    throw error;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decodedToken = jwtDecode<TPayloadToken>(token);
    if (!decodedToken.exp) return true;

    // Get current time in seconds
    const currentTime = Math.floor(Date.now() / 1000);

    // Check if token is expired
    return decodedToken.exp < currentTime;
  } catch {
    return true;
  }
};

export const handleAuthError = () => {
  // Clear auth state
  store.dispatch(authActions.clear());
  // Redirect to login
  router.push('/(auth)/login');
};
