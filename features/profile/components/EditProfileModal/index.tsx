import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Interest, ProfileFormData } from '../../interfaces';
import React, { useEffect, useState } from 'react';
import {
  useGetInterestsQuery,
  useSetUserInterestsMutation,
  useGetUserInterestsQuery,
} from '@/rtk-query';
import { showErrorToast, showSuccessToast } from '@/helpers/toast.helper';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { styles } from './styles';
import InterestSelector from '@/features/shared/components/InterestSelector';

// Define interface for the user interests response
interface UserInterestsResponse {
  interestIds?: number[];
  interests?: Array<
    { interest_id: number; interest_name: string } | { id: number } | number
  >;
}

export interface EditProfileModalProps {
  visible: boolean;
  isUpdating: boolean;
  initialData: ProfileFormData;
  onClose: () => void;
  onSave: (data: ProfileFormData) => Promise<void> | void;
  filterInterests?: number[]; // Add new prop for filter interests
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  isUpdating,
  initialData,
  onClose,
  onSave,
  filterInterests = [], // Default to empty array
}) => {
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isUpdatingInterests, setIsUpdatingInterests] = useState(false);
  const { data: interests = [], isLoading: isLoadingInterests } =
    useGetInterestsQuery();
  const { data: userInterests } = useGetUserInterestsQuery<{
    data: UserInterestsResponse;
  }>(undefined, {
    skip: !visible, // Only fetch when modal is visible
  });
  const [setUserInterests] = useSetUserInterestsMutation();

  // Update form data when initial data changes or when modal becomes visible
  useEffect(() => {
    if (visible) {
      setFormData(initialData);
    }
  }, [visible, initialData]);

  // Update form data with user interests from API when they're loaded
  useEffect(() => {
    if (visible && userInterests) {
      let interestIds: number[] = [];

      // Extract interest IDs from the user interests response
      if (Array.isArray(userInterests)) {
        interestIds = userInterests
          .map((interest: any) =>
            typeof interest === 'number'
              ? interest
              : interest.interest_id || interest.id
          )
          .filter(Boolean);
      } else if (
        userInterests.interestIds &&
        Array.isArray(userInterests.interestIds)
      ) {
        interestIds = userInterests.interestIds;
      } else if (
        userInterests.interests &&
        Array.isArray(userInterests.interests)
      ) {
        interestIds = userInterests.interests
          .map((interest: any) =>
            typeof interest === 'number'
              ? interest
              : interest.interest_id || interest.id
          )
          .filter(Boolean);
      }

      // Update formData with the fetched interests
      if (interestIds.length > 0) {
        setFormData((prev) => ({
          ...prev,
          interests: interestIds,
        }));
      }
    }
  }, [visible, userInterests]);

  const handleSave = async () => {
    try {
      setIsUpdatingInterests(true);
      await onSave(formData);

      // Update user interests separately if provided
      if (formData.interests && formData.interests.length > 0) {
        await setUserInterests(formData.interests).unwrap();
      }

      showSuccessToast('Profile updated successfully');
      onClose();
    } catch (error) {
      // Error will be handled by the parent component
      console.error('[Edit Profile Error]:', error);
      showErrorToast('Failed to update profile');
    } finally {
      setIsUpdatingInterests(false);
    }
  };

  const handleChange = (key: keyof ProfileFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (_: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange('birthdate', selectedDate.toISOString());
    }
  };

  const handleInterestToggle = (interestId: number) => {
    setFormData((prev) => {
      const currentInterests = prev.interests || [];

      if (currentInterests.includes(interestId)) {
        // Remove interest if already selected
        return {
          ...prev,
          interests: currentInterests.filter((id) => id !== interestId),
        };
      } else {
        // Add interest if not already selected
        return {
          ...prev,
          interests: [...currentInterests, interestId],
        };
      }
    });
  };

  // Format birthdate for display
  const formatBirthdate = () => {
    if (!formData.birthdate) return 'Not set';

    try {
      const date = new Date(formData.birthdate);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  const selectedDate = formData.birthdate
    ? new Date(formData.birthdate)
    : new Date();

  const isSaveDisabled = isUpdating || isUpdatingInterests;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView style={styles.scrollContainer}>
            <Text style={styles.title}>Edit Profile</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={formData.full_name}
              onChangeText={(text) => handleChange('full_name', text)}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={formData.phone_number}
              onChangeText={(text) => handleChange('phone_number', text)}
              keyboardType="phone-pad"
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Birthdate</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text>{formatBirthdate()}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.gender || 'other'}
                  onValueChange={(value) => handleChange('gender', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>
            </View>

            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Bio"
              value={formData.bio}
              onChangeText={(text) => handleChange('bio', text)}
              multiline
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Interests</Text>
              <InterestSelector
                interests={interests}
                selectedInterests={formData.interests || []}
                onToggleInterest={handleInterestToggle}
                isLoading={isLoadingInterests}
                highlightedInterests={filterInterests}
                containerStyle={styles.interestsContainer}
                disabled={isUpdatingInterests}
              />
            </View>
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isSaveDisabled}
            >
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={isSaveDisabled}
            >
              {isSaveDisabled ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  Save
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
