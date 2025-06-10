import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useGetInterestsQuery, useSetUserInterestsMutation } from '@/rtk-query';
import { useDispatch } from 'react-redux';
import { setFilterInterests } from '@/store/global/discover/discover-filters.slice';
import InterestSelector from '@/features/shared/components/InterestSelector';

interface FilterFormProps {
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
  isLoading?: boolean; // Add isLoading prop
}

export interface FilterOptions {
  ageRange: [number, number];
  gender: string[];
  distance: number;
  useDistance: boolean;
  currentLocation?: {
    latitude?: number;
    longitude?: number;
  };
  interests: number[]; // Changed from string[] to number[] to use interest IDs
}

// Default filter values for reset functionality
const DEFAULT_FILTERS: FilterOptions = {
  ageRange: [18, 35],
  gender: [],
  distance: 50,
  useDistance: true, // Default to using distance filter
  currentLocation: {
    latitude: 37.7749,
    longitude: -122.4194,
  },
  interests: [],
};

// Fixed distance options in kilometers
const DISTANCE_OPTIONS = [5, 10, 25, 50, 100, 150, 200];

// Create a memoized FilterForm component
const FilterFormComponent = ({
  onClose,
  onApply,
  initialFilters,
  isLoading = false,
}: FilterFormProps) => {
  const [filters, setFilters] = useState<FilterOptions>(
    initialFilters || DEFAULT_FILTERS
  );
  const [minAge, setMinAge] = useState(filters.ageRange[0].toString());
  const [maxAge, setMaxAge] = useState(filters.ageRange[1].toString());
  const dispatch = useDispatch();
  const [updateUserInterests] = useSetUserInterestsMutation();

  // Use a prefetch strategy for interests - with skip option to avoid refetching on modal open
  const { data: dbInterests, isLoading: isLoadingInterests } =
    useGetInterestsQuery(undefined, { refetchOnMountOrArgChange: false });

  const genders = useMemo(() => ['Male', 'Female', 'Other'], []);

  // Update ageRange in filters when min/max age inputs change
  useEffect(() => {
    const min = parseInt(minAge) || 18;
    const max = parseInt(maxAge) || 35;

    if (min > 0 && max > 0 && min <= max) {
      setFilters((prev) => ({
        ...prev,
        ageRange: [min, max],
      }));
    }
  }, [minAge, maxAge]);

  // Reset filters to default values
  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setMinAge(DEFAULT_FILTERS.ageRange[0].toString());
    setMaxAge(DEFAULT_FILTERS.ageRange[1].toString());
  }, []);

  // Handle min/max age input validation
  const handleAgeChange = useCallback((value: string, isMin: boolean) => {
    if (isMin) {
      setMinAge(value);
    } else {
      setMaxAge(value);
    }
  }, []);

  // Check if an interest ID is selected - memoized for performance
  const isInterestSelected = useCallback(
    (interestId: number) => {
      return filters.interests.includes(interestId);
    },
    [filters.interests]
  );

  // Toggle an interest selection without updating Redux on every toggle
  const toggleInterest = useCallback(
    (interestId: number) => {
      if (isLoading) return; // Don't toggle if loading

      setFilters((prev) => {
        const updatedInterests = isInterestSelected(interestId)
          ? prev.interests.filter((id) => id !== interestId)
          : [...prev.interests, interestId];

        // Remove Redux dispatch from here - we'll do it once when applying filters
        return {
          ...prev,
          interests: updatedInterests,
        };
      });
    },
    [isLoading, isInterestSelected]
  );

  // Apply filters and update Redux store
  const handleApplyFilters = useCallback(() => {
    if (isLoading) return; // Don't apply if loading

    // Store the selected interests in Redux - now done ONCE here instead of on each toggle
    dispatch(setFilterInterests(filters.interests));

    // Apply filters to the discovery results
    onApply(filters);

    // Close modal after applying filters
    onClose();
  }, [isLoading, filters, dispatch, onApply, onClose]);

  // Toggle gender selection
  const toggleGender = useCallback(
    (gender: string) => {
      if (isLoading) return;

      setFilters((prev) => ({
        ...prev,
        gender: prev.gender.includes(gender)
          ? prev.gender.filter((g) => g !== gender)
          : [...prev.gender, gender],
      }));
    },
    [isLoading]
  );

  // Toggle distance filter
  const toggleDistanceFilter = useCallback(
    (value: boolean) => {
      if (isLoading) return;

      setFilters((prev) => ({
        ...prev,
        useDistance: value,
      }));
    },
    [isLoading]
  );

  // Set distance value
  const setDistance = useCallback(
    (distance: number) => {
      if (isLoading) return;

      setFilters((prev) => ({
        ...prev,
        distance: distance,
      }));
    },
    [isLoading]
  );

  const isDisabled = isLoading || isLoadingInterests;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} disabled={isDisabled}>
          <Icon
            name="arrow-back"
            size={24}
            color={isDisabled ? '#999' : '#000'}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Filters</Text>
        <TouchableOpacity onPress={handleApplyFilters} disabled={isDisabled}>
          <Text style={[styles.applyText, isDisabled && { color: '#aaa' }]}>
            Apply
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Reset Filters Button */}
        <TouchableOpacity
          style={[styles.resetButton, isDisabled && styles.disabledControl]}
          onPress={handleResetFilters}
          disabled={isDisabled}
        >
          <Text
            style={[styles.resetButtonText, isDisabled && styles.disabledText]}
          >
            Reset Filters
          </Text>
        </TouchableOpacity>

        {/* Age Range with two input fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Age Range</Text>
          <View style={styles.ageRangeInputs}>
            <View style={styles.ageInputContainer}>
              <TextInput
                style={[styles.ageInput, isDisabled && { opacity: 0.6 }]}
                keyboardType="numeric"
                value={minAge}
                onChangeText={(value) => handleAgeChange(value, true)}
                maxLength={2}
                editable={!isDisabled}
              />
              <Text style={styles.ageInputLabel}>Min</Text>
            </View>
            <Text style={styles.ageSeparator}>-</Text>
            <View style={styles.ageInputContainer}>
              <TextInput
                style={[styles.ageInput, isDisabled && { opacity: 0.6 }]}
                keyboardType="numeric"
                value={maxAge}
                onChangeText={(value) => handleAgeChange(value, false)}
                maxLength={2}
                editable={!isDisabled}
              />
              <Text style={styles.ageInputLabel}>Max</Text>
            </View>
          </View>
        </View>

        {/* Gender */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gender</Text>
          <View style={styles.checkboxGroup}>
            {genders.map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[styles.checkbox, isDisabled && { opacity: 0.6 }]}
                onPress={() => toggleGender(gender)}
                disabled={isDisabled}
              >
                <Icon
                  name={
                    filters.gender.includes(gender)
                      ? 'checkbox'
                      : 'square-outline'
                  }
                  size={24}
                  color={isDisabled ? '#aaa' : '#46ec62'}
                />
                <Text
                  style={[
                    styles.checkboxLabel,
                    isDisabled && { color: '#aaa' },
                  ]}
                >
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Distance with fixed options */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Maximum Distance</Text>
            <Switch
              value={filters.useDistance}
              onValueChange={toggleDistanceFilter}
              disabled={isDisabled}
              trackColor={{ false: '#d4d4d4', true: '#cceccc' }}
              thumbColor={filters.useDistance ? '#46ec62' : '#f4f4f4'}
            />
          </View>

          <View
            style={[
              styles.distanceOptions,
              (!filters.useDistance || isDisabled) && styles.disabledControl,
            ]}
          >
            {DISTANCE_OPTIONS.map((distance) => (
              <TouchableOpacity
                key={distance}
                style={[
                  styles.distanceOption,
                  filters.distance === distance &&
                    styles.selectedDistanceOption,
                  (!filters.useDistance || isDisabled) &&
                    styles.disabledControl,
                ]}
                disabled={!filters.useDistance || isDisabled}
                onPress={() => setDistance(distance)}
              >
                <Text
                  style={[
                    styles.distanceOptionText,
                    filters.distance === distance &&
                      styles.selectedDistanceOptionText,
                    (!filters.useDistance || isDisabled) && styles.disabledText,
                  ]}
                >
                  {distance} km
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Interests from database - Updated to use shared component */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <InterestSelector
            interests={dbInterests}
            selectedInterests={filters.interests}
            onToggleInterest={toggleInterest}
            isLoading={isLoadingInterests}
            containerStyle={styles.interestsGrid}
            disabled={isDisabled}
          />
        </View>
      </ScrollView>
    </View>
  );
};

// Export the memoized component as named export
export const FilterForm = React.memo(FilterFormComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  applyText: {
    color: '#46ec62',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  ageRangeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageInputContainer: {
    alignItems: 'center',
  },
  ageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: 80,
    textAlign: 'center',
    fontSize: 16,
  },
  ageInputLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  ageSeparator: {
    fontSize: 20,
    marginHorizontal: 16,
    color: '#666',
  },
  checkboxGroup: {
    gap: 12,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxLabel: {
    fontSize: 16,
  },
  distanceOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  distanceOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  selectedDistanceOption: {
    backgroundColor: '#46ec62',
    borderColor: '#46ec62',
  },
  distanceOptionText: {
    color: '#666',
  },
  selectedDistanceOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  interestTagSelected: {
    backgroundColor: '#46ec62',
    borderColor: '#46ec62',
  },
  interestText: {
    color: '#666',
  },
  interestTextSelected: {
    color: '#fff',
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  resetButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledControl: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#aaa',
  },
  loadingText: {
    color: '#666',
    fontStyle: 'italic',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});
