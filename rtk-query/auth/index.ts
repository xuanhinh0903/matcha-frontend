import {
  EndpointBuilder,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
} from '@reduxjs/toolkit/dist/query';

import { type TResponse } from '../../types';
import {
  type TSignInRequest,
  type TSignInResponse,
  type TSignUpResponse,
  type TGetProfileResponse,
} from '../../types/auth.type';
import { authActions } from '@/store/global/auth/auth.slice';
import type { TagTypes } from '../types';

type TUpdateProfileRequest = {
  full_name?: string;
  phone_number?: string;
  bio?: string;
  gender?: 'male' | 'female' | 'other';
  birthdate?: string; // ISO date string
  is_verified?: boolean;
  location?: {
    type: string;
    coordinates: string[];
  }; // New location field
};

export const authApi = (
  builder: EndpointBuilder<
    BaseQueryFn<
      string | FetchArgs,
      unknown,
      FetchBaseQueryError,
      {},
      FetchBaseQueryMeta
    >,
    TagTypes,
    'matchaAPI'
  >
) => ({
  signIn: builder.mutation<TSignInResponse, unknown>({
    query: (body: TSignInRequest) => ({
      url: 'auth/login',
      method: 'POST',
      body,
    }),
    transformResponse: (response: TSignInResponse) => {
      console.log('SignIn response:', response);
      return response;
    },
    invalidatesTags: [{ type: 'Auth', id: 'LIST' }],
  }),

  signUp: builder.mutation<TSignUpResponse, unknown>({
    query: (body: TSignInRequest) => ({
      url: 'auth/register',
      method: 'POST',
      body,
    }),
    transformResponse: (response: TResponse<TSignUpResponse>) => response.data,
    invalidatesTags: [{ type: 'Auth', id: 'LIST' }],
  }),

  getProfile: builder.query<TGetProfileResponse, void>({
    query: () => ({
      url: 'user/info',
      method: 'GET',
    }),
    providesTags: [{ type: 'Profile', id: 'ME' }],
  }),

  updateProfile: builder.mutation<TGetProfileResponse, TUpdateProfileRequest>({
    query: (body) => ({
      url: 'user/update',
      method: 'PUT',
      body,
    }),
    invalidatesTags: [{ type: 'Profile', id: 'ME' }],
  }),

  uploadPhotos: builder.mutation<void, FormData>({
    query: (formData) => ({
      url: 'user-photo/upload-multiple',
      method: 'POST',
      body: formData,
    }),
    invalidatesTags: [{ type: 'Profile', id: 'ME' }],
  }),

  deletePhoto: builder.mutation<void, number>({
    query: (photoId) => ({
      url: `user-photo/delete/${photoId}`,
      method: 'DELETE',
    }),
    invalidatesTags: [{ type: 'Profile', id: 'ME' }],
  }),

  logout: builder.mutation<void, void>({
    query: () => ({
      url: 'auth/logout',
      method: 'POST',
    }),
    async onQueryStarted(_, { dispatch, queryFulfilled }) {
      try {
        await queryFulfilled;
        // Clear auth state
        dispatch(authActions.logout());
      } catch {
        // Handle error if needed
      }
    },
  }),

  updateAvatar: builder.mutation<TGetProfileResponse, FormData>({
    query: (formData) => ({
      url: 'user-photo/update-avatar',
      method: 'POST',
      body: formData,
    }),
    invalidatesTags: [{ type: 'Profile', id: 'ME' }],
  }),
});
