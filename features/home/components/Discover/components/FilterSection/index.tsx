import React, { useEffect } from 'react';
import { Modal } from 'react-native';
import { FilterButton } from '../FilterButton';
import { FilterForm, FilterOptions } from '../FilterForm';
import { useGetInterestsQuery } from '@/rtk-query';

interface FilterSectionProps {
  showFilter: boolean;
  toggleFilterModal: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  initialFilters: FilterOptions;
  isLoading?: boolean;
}

// Create the FilterSection component first, then memoize it
const FilterSectionComponent = ({
  showFilter,
  toggleFilterModal,
  onApplyFilters,
  initialFilters,
  isLoading = false,
}: FilterSectionProps) => {
  // Prefetch interests data when component mounts, not when modal opens
  const { refetch } = useGetInterestsQuery(undefined, {
    skip: false, // Don't skip the initial fetch
    refetchOnMountOrArgChange: false, // Don't refetch on re-mount
  });

  // Prefetch interests data when component mounts
  useEffect(() => {
    // Prefetch interests data to have it ready before modal opens
    refetch();
  }, [refetch]);

  return (
    <>
      <FilterButton onPress={toggleFilterModal} disabled={isLoading} />
      <Modal
        visible={showFilter}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <FilterForm
          onClose={toggleFilterModal}
          onApply={onApplyFilters}
          initialFilters={initialFilters}
          isLoading={isLoading}
        />
      </Modal>
    </>
  );
};

// Export the memoized component correctly
export const FilterSection = React.memo(FilterSectionComponent);
