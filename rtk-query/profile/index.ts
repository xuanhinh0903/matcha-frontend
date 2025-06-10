import {
  EndpointBuilder,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
} from '@reduxjs/toolkit/dist/query';
import {
  TGetProfilePhotosResponse,
  TGetProfileStatsResponse,
} from '@/types/profile.type';
import type { TagTypes } from '../types';

export const profileApi = (
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
  getProfileStats: builder.query<TGetProfileStatsResponse, void>({
    query: () => ({
      url: 'user/matchStats',
      method: 'GET',
    }),
    transformResponse: (response: TGetProfileStatsResponse) => response,
    providesTags: [{ type: 'Profile', id: 'matchStats' }],
  }),

  getUserPhotos: builder.query({
    query: () => ({
      url: 'user-photo',
      method: 'GET',
    }),
    transformResponse: (response: TGetProfilePhotosResponse[]) => response,
    providesTags: [{ type: 'Profile', id: 'user-photo' }],
  }),
});
