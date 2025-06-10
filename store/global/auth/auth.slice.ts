import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

import { matchaAPI } from '../../../rtk-query';
import { type RootState } from '..';
import { authReducer } from './auth.reducer';

export type TPayloadToken = {
  id: number;
  email: string;
  full_name: string;
  profileImg: string;
  description: string;
  photos: string[];
  birthdate: string;
  gender: string;
  exp?: number; // JWT expiration timestamp
  iat?: number; // JWT issued at timestamp
  interests?: string[];
  // isVerified?: boolean;
  is_verified?: boolean;
  role?: 'user' | 'admin'; // Added role field for admin functionality
  profile_thumbnail?: string;
};

export type TAuthInitialState = {
  user: TPayloadToken | null;
  token: string | null;
};

export const authInitialState: TAuthInitialState = {
  user: null,
  token: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState: authInitialState,
  reducers: authReducer,
  extraReducers: (builder) => {
    builder
      .addMatcher(
        matchaAPI.endpoints.signIn.matchFulfilled,
        (state, { payload }) => {
          try {
            const decoded: TPayloadToken = jwtDecode(payload.token);
            state.user = {
              id: (decoded as any).userId,
              email: decoded.email,
              full_name: decoded.full_name,
              profileImg: decoded.profileImg,
              description: decoded.description,
              exp: decoded.exp,
              iat: decoded.iat,
              photos: [],
              birthdate: decoded.birthdate || '',
              gender: decoded.gender || '',
              interests: decoded.interests || [],
              is_verified: decoded.is_verified || false,
              role: decoded.role || 'user', // Default to 'user' if not specified
            };
            state.token = payload.token;
          } catch (error) {
            console.error('Failed to decode token:', error);
            state.user = null;
            state.token = null;
          }
        }
      )
      .addMatcher(matchaAPI.endpoints.signIn.matchRejected, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const getAuthUser = (state: RootState): TPayloadToken | null => {
  return state.auth.user;
};

export const getAuthToken = (state: RootState): string | null => {
  return state.auth.token;
};

export const authActions = authSlice.actions;
export const authReducers = authSlice.reducer;

// Add selector for checking admin role
export const isUserAdmin = (state: RootState): boolean => {
  return state.auth.user?.role === 'admin';
};
