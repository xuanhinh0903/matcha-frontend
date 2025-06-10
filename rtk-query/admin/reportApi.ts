import {
  AdminReportDetailResponse,
  AdminReportListResponse,
  ResolveReportRequest,
  ResolveReportResponse,
} from '@/api/types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { BASE_URL as apiEndpoint } from '@/constants';
import { prepareHeadersWithToken } from '../utils';

// Change the reducer path to match what we're using in the store
export const adminReportApi = createApi({
  reducerPath: 'adminReportApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${apiEndpoint}reports`,
    prepareHeaders: prepareHeadersWithToken,
  }),
  tagTypes: ['AdminReports', 'AdminReport'],
  endpoints: (builder) => ({
    getReports: builder.query<AdminReportListResponse, string | void>({
      query: (filter) => ({
        url: filter ? `?filter=${filter}` : '',
      }),
      providesTags: ['AdminReports'],
    }),

    getReportById: builder.query<AdminReportDetailResponse, number>({
      query: (reportId) => ({
        url: `${reportId}`,
      }),
      providesTags: (_result, _error, reportId) => [
        { type: 'AdminReport', id: reportId },
      ],
    }),

    resolveReport: builder.mutation<
      ResolveReportResponse,
      { reportId: number; data: ResolveReportRequest }
    >({
      query: ({ reportId, data }) => ({
        url: `${reportId}/resolve`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { reportId }) => [
        'AdminReports',
        { type: 'AdminReport', id: reportId },
      ],
    }),
  }),
});

export const {
  useGetReportsQuery,
  useGetReportByIdQuery,
  useResolveReportMutation,
} = adminReportApi;
