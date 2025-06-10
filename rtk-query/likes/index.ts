import { IDiscoverUser } from '@/types/discover.type';
import {
  BaseQueryFn,
  EndpointBuilder,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/dist/query';

export interface LikesResponse {
  users: IDiscoverUser[];
  total: number;
  page: number;
  limit: number;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface LikeUserResponse {
  message: string;
  status: string;
  conversation_id?: string;
  isMatch: boolean; // Changed from optional to required with default value
  matchedUser?: {
    user_id: string;
    full_name: string;
    profile_picture: string;
  };
  is_processing_details?: boolean;
}

export const likesApi = (
  builder: EndpointBuilder<
    BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
    'Likes' | 'Profile' | 'Auth' | 'Discover' | 'Notifications' | 'Interests',
    'matchaAPI'
  >
) => ({
  getLikesReceived: builder.query<LikesResponse, PaginationParams>({
    query: (params = { page: 1, limit: 10 }) => ({
      url: `match/likes-received?page=${params.page}&limit=${params.limit}`,
      method: 'GET',
    }),
    providesTags: [{ type: 'Likes', id: 'RECEIVED' }],
  }),

  getLikesSent: builder.query<LikesResponse, PaginationParams>({
    query: (params = { page: 1, limit: 10 }) => ({
      url: `match/likes-sent?page=${params.page}&limit=${params.limit}`,
      method: 'GET',
    }),
    providesTags: [{ type: 'Likes', id: 'SENT' }],
  }),

  likeUser: builder.mutation<LikeUserResponse, string>({
    query: (userId: string) => ({
      url: `match/like/${userId}`,
      method: 'POST',
    }),
    transformResponse: (response: any): LikeUserResponse => {
      // Ensure isMatch is a boolean
      return {
        ...response,
        isMatch: !!response.isMatch,
      };
    },
    invalidatesTags: [
      { type: 'Likes', id: 'SENT' },
      { type: 'Likes', id: 'RECEIVED' },
    ],
  }),

  unlikeUser: builder.mutation<{ message: string; status: string }, string>({
    query: (userId: string) => ({
      url: `match/unlike/${userId}`,
      method: 'POST',
    }),
    invalidatesTags: [{ type: 'Likes', id: 'SENT' }],
  }),

  dislikeUser: builder.mutation<LikeUserResponse, string>({
    query: (userId: string) => ({
      url: `match/dislike/${userId}`,
      method: 'POST',
    }),
    transformResponse: (response: any): LikeUserResponse => {
      // Ensure isMatch is a boolean (should always be false for dislike)
      return {
        ...response,
        isMatch: false,
      };
    },
  }),
});
