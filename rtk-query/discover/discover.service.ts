import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query";
import{ IDiscoverPeopleResponse, IFindPeopleParams } from "../../types";
//gọi API lấy danh sách người dùng
export const discoverApi = createApi({
  reducerPath: "discoverApi",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.EXPO_PUBLIC_API_URL, }),
  endpoints: (builder) => ({
    findPeople: builder.query<IDiscoverPeopleResponse, IFindPeopleParams>({
      query: ({ page = 1, limit = 10, lat, lon , gender, range, minAge, maxAge }) => ({
        url: "match/recommend",
        method: "GET",
        params: { page, limit, lat, lon, gender, range, minAge, maxAge },
      }),
    }),
  }),
});