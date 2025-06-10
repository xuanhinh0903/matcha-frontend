import { Interest, PrivacySettings } from '@/features/profile/interfaces';
import { type RootState } from '@/store/global';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { authApi } from './auth';
import { discoverApi } from './discover';
import { likesApi } from './likes';
import { notificationsApi } from './notifications';
import { profileApi } from './profile';
import { tagTypes } from './types';

// Export APIs for middleware configuration
export { adminReportApi } from './admin/reportApi';
export { messagesApi } from './messages';

export const matchaAPI = createApi({
  reducerPath: 'matchaAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      if ((state.auth as any)?.token) {
        headers.set('Authorization', `Bearer ${(state.auth as any).token}`);
      }
      return headers;
    },
  }),
  tagTypes,
  // Add these options to prevent unnecessary API calls
  refetchOnFocus: false,
  refetchOnReconnect: false,
  endpoints: (builder) => ({
    ...authApi(builder),
    ...discoverApi(builder),
    ...notificationsApi(builder),
    ...likesApi(builder),
    ...profileApi(builder),
    // Interests endpoints
    getInterests: builder.query<Interest[], void>({
      query: () => ({
        url: 'interest',
        method: 'GET',
      }),
      providesTags: [{ type: 'Interests', id: 'LIST' }],
    }),

    // Updated getUserInterests endpoint to use the correct URL
    getUserInterests: builder.query<number[], void>({
      query: () => ({
        url: 'user-interest', // The correct endpoint path
        method: 'GET',
      }),
      transformResponse: (response: any) => {
        console.log('User interests response:', response);
        // Handle different response formats
        if (Array.isArray(response)) {
          // If the response is already an array of interest objects
          return response.map((interest: any) =>
            typeof interest === 'number'
              ? interest
              : interest.interest_id || interest.id
          );
        } else if (
          response &&
          response.interests &&
          Array.isArray(response.interests)
        ) {
          // If the response has an interests property
          return response.interests.map((interest: any) =>
            typeof interest === 'number'
              ? interest
              : interest.interest_id || interest.id
          );
        }
        // Default empty array if no interests found or unexpected format
        return [];
      },
      providesTags: [{ type: 'Profile', id: 'USER_INTERESTS' }],
    }),

    setUserInterests: builder.mutation<void, number[]>({
      query: (interestIds) => ({
        url: 'user-interest',
        method: 'POST',
        body: { interestIds },
      }),
      invalidatesTags: [
        { type: 'Profile', id: 'ME' },
        { type: 'Profile', id: 'USER_INTERESTS' },
      ],
    }),

    savePrivacySettings: builder.mutation<void, PrivacySettings>({
      query: (settings) => ({
        url: 'user-settings/privacy',
        method: 'PUT',
        body: settings,
      }),
      invalidatesTags: [{ type: 'Profile', id: 'ME' }],
    }),
  }),
});

export const {
  useSignInMutation,
  useSignUpMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadPhotosMutation,
  useDeletePhotoMutation,
  useFindPeopleQuery,
  useLazyFindPeopleQuery,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useRegisterDeviceMutation,
  useSavePrivacySettingsMutation,
  useGetInterestsQuery,
  useGetUserInterestsQuery,
  useSetUserInterestsMutation,
  useUpdateAvatarMutation,
  useGetLikesReceivedQuery,
  useGetLikesSentQuery,
  useLikeUserMutation,
  useUnlikeUserMutation,
  useDislikeUserMutation,
  useGetProfileStatsQuery,
  useGetUserPhotosQuery,
  useDeleteNotificationMutation,
} = matchaAPI;
