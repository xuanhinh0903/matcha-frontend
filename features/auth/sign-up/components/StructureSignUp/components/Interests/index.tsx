import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetInterestsQuery, useSetUserInterestsMutation } from '@/rtk-query';

import { Button } from '@/components/ui/Button/matcha-button';
import { IStepSignUP } from '@/features/auth/sign-up/sign-up.type';
import { UploadProgress } from '@/features/profile/components';
import { UserInfo } from '@/app/(auth)/not-verify-account';
import { authActions } from '@/store/global/auth';
import { getAuthUser } from '@/store/global/auth/auth.slice';
import { showErrorToast } from '@/helpers/toast.helper';
import { styles } from './styles';
import InterestSelector from '@/features/shared/components/InterestSelector';

interface InterestsProps {
  step: IStepSignUP;
  setStep: React.Dispatch<React.SetStateAction<IStepSignUP | null>>;
  setUser: React.Dispatch<React.SetStateAction<UserInfo>>;
  user: UserInfo;
}

export const Interests = ({ step, setStep, setUser, user }: InterestsProps) => {
  const userAuth = useSelector(getAuthUser);
  const [selectedInterests, setSelectedInterests] = useState<number[]>(() => {
    return userAuth?.interests?.map((interest) => Number(interest)) || [];
  });
  const [isUploading, setIsUploading] = useState(false);
  const { data: interests, isLoading } = useGetInterestsQuery();
  const [updateUserInterests, { isLoading: isLoadingSetUserInterests }] =
    useSetUserInterestsMutation();
  const dispatch = useDispatch();

  const toggleInterest = (interestId: number) => {
    const isSelected = selectedInterests.includes(interestId);
    let updatedInterests;
    if (isSelected) {
      updatedInterests = selectedInterests.filter(
        (item) => item !== interestId
      );
    } else {
      updatedInterests = [...selectedInterests, interestId];
    }
    setSelectedInterests(updatedInterests);
    setUser((prevUser: UserInfo) => ({
      ...prevUser,
      interests: updatedInterests,
    }));
  };

  const handleContinue = async () => {
    try {
      setIsUploading(true);
      const response = await updateUserInterests(selectedInterests);
      if ('error' in response) {
        showErrorToast(response.error);
        return;
      }
      setStep(IStepSignUP.UPLOAD_IMAGE);

      dispatch(
        authActions.setAuthProfile({
          user: {
            ...userAuth,
            interests: selectedInterests,
          },
        } as any)
      );
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View>
          <Text style={styles.title}>Interests</Text>
          <Text style={styles.description}>
            Let everyone know what you're interested in by adding it to your
            profile.
          </Text>
          <InterestSelector
            interests={interests}
            selectedInterests={selectedInterests}
            onToggleInterest={toggleInterest}
            isLoading={isLoading}
            containerStyle={styles.interestsContainer}
          />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.continueButtonContainer}
        disabled={!selectedInterests.length || isLoadingSetUserInterests}
        onPress={handleContinue}
      >
        <Button
          text="CONTINUE"
          isDisable={!selectedInterests.length || isLoadingSetUserInterests}
          onPress={handleContinue}
        />
      </TouchableOpacity>
      <UploadProgress visible={isUploading || isLoadingSetUserInterests} />
    </View>
  );
};
