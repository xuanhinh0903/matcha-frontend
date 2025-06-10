import { useState, useEffect } from 'react';
import { FilterOptions } from '../components/FilterForm';
import { useFilter } from './useFilter';
import { IDiscoverUser } from '@/types/discover.type';
import { useGetUserInterestsQuery, useGetProfileQuery } from '@/rtk-query';
import { Interest } from '@/features/profile/interfaces';

interface UseFilterStateProps {
  refetch: () => Promise<void> | void;
  userLocation?: {
    latitude?: number;
    longitude?: number;
  };
  setUsers: (users: IDiscoverUser[]) => void;
}

// Define a type for the possible user interests response format
interface UserInterestsResponse {
  interestIds?: number[];
  interests?: Array<{ interest_id: number } | { id: number } | number>;
}

export const useFilterState = ({
  refetch,
  userLocation,
  setUsers,
}: UseFilterStateProps) => {
  const [showFilter, setShowFilter] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const { handleFilter, isLoading: isFilterLoading } = useFilter();

  // Get the current user's profile to check their gender
  const { data: userProfile } = useGetProfileQuery();

  // Fetch the user's interests from the dedicated endpoint
  const { data: userInterestsData, isLoading: isInterestsLoading } =
    useGetUserInterestsQuery();

  // Initialize filters with user's actual location when available
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    ageRange: [18, 35],
    gender: [],
    distance: 50,
    useDistance: true, // Set to true by default
    currentLocation: userLocation || {
      latitude: 37.7749, // Default to San Francisco only if user location isn't available
      longitude: -122.4194,
    },
    interests: [],
  });

  // Update gender filter based on user's own gender when profile is loaded
  useEffect(() => {
    if (userProfile && userProfile.gender) {
      // Set opposite gender based on user's gender
      const oppositeGender =
        userProfile.gender === 'male'
          ? ['Female']
          : userProfile.gender === 'female'
          ? ['Male']
          : [];

      if (oppositeGender.length > 0) {
        console.log('Setting default gender filter to:', oppositeGender);
        setActiveFilters((prev) => ({
          ...prev,
          gender: oppositeGender,
        }));
      }
    }
  }, [userProfile]);

  // Update filters when user interests are loaded
  useEffect(() => {
    if (userInterestsData) {
      console.log('User interests data loaded:', userInterestsData);

      // Extract interest IDs from the response
      let interestIds: number[] = [];

      if (
        typeof userInterestsData === 'object' &&
        userInterestsData !== null &&
        !Array.isArray(userInterestsData)
      ) {
        // Handle response as an object with properties
        const responseObj = userInterestsData as UserInterestsResponse;

        if (responseObj.interestIds && Array.isArray(responseObj.interestIds)) {
          // If response contains interestIds array
          interestIds = responseObj.interestIds;
        } else if (
          responseObj.interests &&
          Array.isArray(responseObj.interests)
        ) {
          // If response contains interests array of objects
          interestIds = responseObj.interests
            .map((interest: any) =>
              typeof interest === 'number'
                ? interest
                : interest.interest_id || interest.id
            )
            .filter((id): id is number => id !== undefined);
        }
      } else if (Array.isArray(userInterestsData)) {
        // If response is directly an array
        interestIds = userInterestsData
          .map((item: any) =>
            typeof item === 'number'
              ? item
              : typeof item === 'object' && item !== null
              ? item.interest_id || item.id
              : null
          )
          .filter((id): id is number => id !== null);
      }

      console.log('Extracted interest IDs for filter:', interestIds);

      if (interestIds.length > 0) {
        setActiveFilters((prev) => ({
          ...prev,
          interests: interestIds,
        }));
        console.log('Updated filter interests:', interestIds);
      }
    }
  }, [userInterestsData]);

  // Update filters when user location changes
  useEffect(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      console.log('Updating filter location with user location:', userLocation);
      setActiveFilters((prev) => ({
        ...prev,
        currentLocation: userLocation,
      }));
    }
  }, [userLocation?.latitude, userLocation?.longitude]);

  // Debug when filter modal is opened
  const toggleFilterModal = () => {
    const newShowFilter = !showFilter;
    console.log(
      newShowFilter ? 'Opening filter with interests:' : 'Closing filter',
      newShowFilter ? activeFilters.interests : ''
    );
    setShowFilter(newShowFilter);
  };

  const handleApplyFilters = async (filters: FilterOptions) => {
    try {
      setActiveFilters(filters);
      setIsFiltering(true);

      // Check if these are effectively default/empty filters
      const isDefaultFilters =
        JSON.stringify(filters.ageRange) === JSON.stringify([18, 35]) &&
        filters.gender.length === 0 &&
        (!filters.useDistance || filters.distance === 50) &&
        filters.interests.length === 0;

      if (isDefaultFilters) {
        // If using default filters, simply refetch original recommendations
        await refetch();
      } else {
        // Otherwise, apply the custom filters
        console.log('Applying filters:', filters);
        const filteredUsers = await handleFilter(filters);
        console.log('Filtered users received:', filteredUsers?.length || 0);

        if (
          filteredUsers &&
          Array.isArray(filteredUsers) &&
          filteredUsers.length > 0
        ) {
          console.log('Setting filtered users to state:', filteredUsers);
          setUsers(filteredUsers);
        } else {
          console.warn('No users found with the applied filters');
          // If no users found with filters, show empty state
          setUsers([]);
        }
      }
      setShowFilter(false);
    } catch (error) {
      console.error('Filter error:', error);
      setShowFilter(false);
    } finally {
      setIsFiltering(false);
    }
  };

  return {
    showFilter,
    isFiltering,
    isFilterLoading: isFilterLoading || isInterestsLoading,
    activeFilters,
    toggleFilterModal,
    handleApplyFilters,
  };
};
