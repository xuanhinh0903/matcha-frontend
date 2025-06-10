import { client } from '@/api/common/client';
import { FilterOptions } from '../components/FilterForm';
import { IDiscoverPeopleResponse } from '@/types';
import { IDiscoverUser } from '@/types/discover.type';

interface FilterParams {
  page: number;
  limit: number;
  lat?: number;
  lon?: number;
  gender?: string;
  range?: number;
  minAge?: number;
  maxAge?: number;
  interests?: string; // Added interests parameter
}

const convertFiltersToParams = (filters: FilterOptions): FilterParams => {
  const params: FilterParams = {
    page: 1,
    limit: 10,
  };

  // Only add location if we're using distance filter
  if (filters.useDistance && filters.currentLocation) {
    params.lat = filters.currentLocation.latitude;
    params.lon = filters.currentLocation.longitude;
    params.range = filters.distance;
  }

  // Handle gender - if multiple genders selected, send comma-separated list
  if (filters.gender.length > 0) {
    params.gender = filters.gender.map((g) => g.toLowerCase()).join(',');
  }

  // Add age range
  params.minAge = filters.ageRange[0];
  params.maxAge = filters.ageRange[1];

  // Add interests if selected
  if (filters.interests.length > 0) {
    params.interests = filters.interests.join(',');
  }

  return params;
};

export const applyFilters = async (filters: FilterOptions) => {
  try {
    const params = convertFiltersToParams(filters);
    console.log('Sending filter params to API:', params); // Log for debugging
    const response = await client.get('/match/recommend', { params });
    console.log('Raw API response:', JSON.stringify(response.data, null, 2));

    // First try to get the response as a standard structure
    const responseData = response.data;

    // Return the proper structure based on the format of response
    if (responseData && Array.isArray(responseData.users)) {
      // Standard IDiscoverPeopleResponse format
      return responseData;
    } else if (responseData && Array.isArray(responseData)) {
      // Direct array of users
      return {
        users: responseData,
        total: responseData.length,
        page: 1,
        limit: responseData.length,
      };
    }

    // Make sure we always return something that has a 'users' property
    // This ensures consistency regardless of the backend response format
    return {
      users: responseData?.users || [],
      total: responseData?.total || 0,
      page: responseData?.page || 1,
      limit: responseData?.limit || 10,
    };
  } catch (error) {
    console.error('Filter API Error:', error);
    throw error;
  }
};
