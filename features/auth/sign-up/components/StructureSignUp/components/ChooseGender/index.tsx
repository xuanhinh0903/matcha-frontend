import * as Location from 'expo-location';

import { Alert, Linking, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@/components/ui/Button/matcha-button';
import { IStepSignUP } from '@/features/auth/sign-up/sign-up.type';
import { LinearGradient } from 'expo-linear-gradient';
import { UploadProgress } from '@/features/profile/components';
import { UserInfo } from '@/app/(auth)/not-verify-account';
import { authActions } from '@/store/global/auth';
import { getAuthUser } from '@/store/global/auth/auth.slice';
import { showErrorToast } from '@/helpers/toast.helper';
import { styles } from './styles';
import { useUpdateProfileMutation } from '@/rtk-query';

interface ChooseGenderProps {
  step: IStepSignUP;
  setStep: React.Dispatch<React.SetStateAction<IStepSignUP | null>>;
  setUser: React.Dispatch<React.SetStateAction<UserInfo>>;
  user: UserInfo;
}

const listGender = [
  {
    id: 1,
    name: 'MAN',
    value: 'male',
  },
  {
    id: 2,
    name: 'WOMAN',
    value: 'female',
  },
];

export const ChooseGender = ({
  step,
  setStep,
  setUser,
  user,
}: ChooseGenderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedGender, setSelectedGender] = useState<number | null>(() => {
    if (user?.gender) {
      const genderItem = listGender.find((g) => g.value === user.gender);
      return genderItem?.id || null;
    }
    return null;
  });
  const [showGenderOnProfile, setShowGenderOnProfile] = useState(() => {
    return user?.showGender || false;
  });
  const [locationData, setLocationData] = useState<Location.LocationObject | null>(null);
  const dispatch = useDispatch();
  const userAuth = useSelector(getAuthUser);
  const [updateProfile, { isLoading: isLoadingUpdateProfile }] =
    useUpdateProfileMutation();

  const handleGenderSelect = (id: number) => {
    setSelectedGender(id);
    const genderValue = listGender.find((g) => g.id === id)?.value;
    setUser((prevUser: UserInfo) => ({
      ...prevUser,
      gender: genderValue as 'male' | 'female' | 'other',
    }));
  };

  const toggleShowGender = () => {
    setShowGenderOnProfile(!showGenderOnProfile);
    setUser((prevUser: UserInfo) => ({
      ...prevUser,
      showGender: !showGenderOnProfile,
    }));
  };

  const handleContinue = async () => {
    try {
      setIsUploading(true);
      const response = await updateProfile({
        full_name: user.name,
        birthdate: user.birthday,
        gender: user.gender as 'male' | 'female' | 'other',
        location: {
          type: 'Point',
          coordinates: [locationData?.coords.longitude?.toString() || '', locationData?.coords.latitude?.toString() || '']
        },
      });

      if ('error' in response) {
        showErrorToast(response.error);
        return;
      }
      dispatch(
        authActions.setAuthProfile({
          user: {
            ...userAuth,
            full_name: user.name,
            birthdate: user.birthday,
            gender: user.gender,
          },
        } as any)
        // TODO: fix type
      );
      setStep(IStepSignUP.UPDATE_AVATAR);
    } catch (error) {
      console.log(error);
      showErrorToast(error);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const checkAndRequestLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          Alert.alert(
            'Lỗi', 
            'Xin vui lòng bật vị trí của bạn cho ứng dụng.',
            [
              { 
                text: 'Mở cài đặt', 
                style: 'default',
                onPress: () => {
                  Linking.openSettings();
                }
              }
            ]
          );
          return;
        }
        
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        setLocationData(location);
        
        // Store location data in state format
        const locationPoint = {
          type: "Point",
          coordinates: [location?.coords.longitude?.toString(), location?.coords.latitude?.toString()]
        };
        
        // Log location data to confirm it's working
        console.log('Location obtained:', locationPoint);
        
      } catch (error) {
        Alert.alert(
          'Lỗi', 
          'Xin vui lòng bật vị trí của bạn cho ứng dụng.',
          [
            { 
              text: 'Mở cài đặt', 
              style: 'default',
              onPress: () => {
                Linking.openSettings();
              }
            }
          ]
        );
      }
    };

    checkAndRequestLocation();
  }, []);

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>I am a</Text>
        <View style={styles.genderContainer}>
          {listGender.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleGenderSelect(item.id)}
            >
              <LinearGradient
                style={[
                  styles.gender,
                  selectedGender === item.id && {
                    backgroundColor: '#35c848',
                    borderColor: '#46ec62',
                  },
                ]}
                colors={
                  selectedGender === item.id
                    ? ['#46ec62', '#35c848']
                    : ['transparent', 'transparent']
                }
              >
                <Text
                  style={[
                    {
                      color: selectedGender === item.id ? '#fff' : '#C6C5C7',
                      fontWeight: '600',
                      textAlign: 'center',
                    },
                  ]}
                >
                  {item.name}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.checkboxWrapper}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={toggleShowGender}
        >
          <View
            style={[
              styles.checkbox,
              showGenderOnProfile && styles.checkboxChecked,
            ]}
          >
            {showGenderOnProfile && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Show my gender on my profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.continueButtonContainer}
          disabled={!user.gender || !user.showGender || isLoadingUpdateProfile}
          onPress={handleContinue}
        >
          <Button
            text="CONTINUE"
            isDisable={
              !user.gender || !user.showGender || isLoadingUpdateProfile
            }
            onPress={handleContinue}
          />
        </TouchableOpacity>
      </View>

      <UploadProgress
        visible={isUploading || isLoadingUpdateProfile}
      />
    </View>
  );
};
