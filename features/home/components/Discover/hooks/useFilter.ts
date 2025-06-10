import { useState } from 'react';
import { applyFilters } from '../api/filterApi';
import { FilterOptions } from '../components/FilterForm';
import { IDiscoverUser } from '@/types/discover.type';

export const useFilter = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilter = async (
    filters: FilterOptions
  ): Promise<IDiscoverUser[]> => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await applyFilters(filters);

      // Debug the response structure
      console.log('Filter API response:', JSON.stringify(response, null, 2));

      // Check various possible locations of the users data in the response
      // The backend might be returning the users array within a structure
      if (response?.users && Array.isArray(response.users)) {
        console.log('Found users in response.users:', response.users.length);
        return response.users;
      } else if (response?.data?.users && Array.isArray(response.data.users)) {
        console.log(
          'Found users in response.data.users:',
          response.data.users.length
        );
        return response.data.users;
      } else if (Array.isArray(response?.data)) {
        console.log(
          'Found users in response.data array:',
          response.data.length
        );
        return response.data;
      } else if (Array.isArray(response)) {
        console.log('Found users in response array:', response.length);
        return response;
      }

      // If we reach here, try to extract any array that might contain user objects
      const potentialUserArrays = findPotentialUserArrays(response);
      if (potentialUserArrays.length > 0) {
        console.log(
          'Found potential user array with length:',
          potentialUserArrays[0].length
        );
        return potentialUserArrays[0];
      }

      console.warn(
        'Filter API: Unexpected response format, could not find users array'
      );
      return [];
    } catch (err) {
      console.error('Filter error details:', err);
      setError(err instanceof Error ? err.message : 'Error filtering users');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to find any arrays in the response that might contain user objects
  const findPotentialUserArrays = (obj: any): any[][] => {
    if (!obj || typeof obj !== 'object') return [];

    // If it's an array that looks like user objects (contains user_id, photos, etc.)
    if (
      Array.isArray(obj) &&
      obj.length > 0 &&
      (obj[0].user_id !== undefined || obj[0].id !== undefined)
    ) {
      return [obj];
    }

    let result: any[][] = [];

    // Check all properties for arrays
    Object.values(obj).forEach((value) => {
      if (Array.isArray(value) && value.length > 0) {
        if (value[0].user_id !== undefined || value[0].id !== undefined) {
          result.push(value);
        }
      } else if (typeof value === 'object' && value !== null) {
        result = [...result, ...findPotentialUserArrays(value)];
      }
    });

    return result;
  };

  return {
    handleFilter,
    isLoading,
    error,
  };
};
