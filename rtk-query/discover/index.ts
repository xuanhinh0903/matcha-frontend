import {
  BaseQueryFn,
  EndpointBuilder,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from '@reduxjs/toolkit/dist/query';
import { IDiscoverPeopleResponse, IFindPeopleParams } from '../../types';
import type { TagTypes } from '../types';

export const discoverApi = (
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
  findPeople: builder.query<IDiscoverPeopleResponse, IFindPeopleParams>({
    query: ({
      page = 1,
      limit = 10,
      lat,
      lon,
      gender,
      range,
      minAge,
      maxAge,
    }) => ({
      url: 'match/recommend',
      method: 'GET',
      params: {
        page,
        limit,
        lat,
        lon,
        gender,
        range,
        minAge,
        maxAge,
      },
      // Add cache-busting headers
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }),
    keepUnusedDataFor: 0, // Immediately remove data when unused
  }),
});
