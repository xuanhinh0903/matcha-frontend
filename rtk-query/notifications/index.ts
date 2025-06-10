import {
  EndpointBuilder,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
  type FetchBaseQueryMeta,
} from '@reduxjs/toolkit/dist/query';
import { type NotificationResponse } from '@/types/notification.type';
import type { TagTypes } from '../types';

type GetNotificationsParams = {
  page?: number;
  limit?: number;
};

type RegisterDeviceRequest = {
  token: string;
  platform?: 'android';
};

export const notificationsApi = (
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
  getNotifications: builder.query<NotificationResponse, GetNotificationsParams>(
    {
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: 'notifications',
        method: 'GET',
        params: {
          page,
          limit,
          sort: 'sent_at:desc', // Sort by newest first
        },
      }),
      providesTags: ['Notifications'],
    }
  ),

  markNotificationAsRead: builder.mutation<void, { id: string }>({
    query: ({ id }) => ({
      url: `notifications/${id}/read`,
      method: 'PATCH',
    }),
    invalidatesTags: ['Notifications'],
  }),

  markAllNotificationsAsRead: builder.mutation<void, void>({
    query: () => ({
      url: 'notifications/read-all',
      method: 'PATCH',
    }),
    invalidatesTags: ['Notifications'],
  }),

  registerDevice: builder.mutation<void, RegisterDeviceRequest>({
    query: (body) => ({
      url: 'notifications/register-device',
      method: 'POST',
      body,
    }),
  }),
  deleteNotification: builder.mutation<void, { id: string }>({
    query: (params) => ({
      url: `notifications/${params.id}`,
      method: 'DELETE',
    }),
    invalidatesTags: ['Notifications'],
  }),
});
