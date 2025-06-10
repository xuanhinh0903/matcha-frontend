import axios from 'axios';
import { store } from '@/store/global';
import { type RootState } from '@/store/global';
import { handleAuthError, isTokenExpired } from '@/helpers/auth.helper';
import { type TAuthInitialState } from '@/store/global/auth/auth.slice';

export const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// Request interceptor
client.interceptors.request.use(
  (config) => {
    const state = store.getState() as RootState;
    const authState = state.auth as TAuthInitialState;

    if (authState?.token) {
      // Check token expiration before making request
      if (isTokenExpired(authState.token)) {
        handleAuthError();
        return Promise.reject(new Error('Token expired'));
      }

      config.headers.Authorization = `Bearer ${authState.token}`;
    }

    // Add cache control headers to prevent 304 responses
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 and 403 errors
    if (error.response && [401, 403].includes(error.response.status)) {
      handleAuthError();
    }
    return Promise.reject(error);
  }
);
