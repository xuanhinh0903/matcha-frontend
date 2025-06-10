import {
  BirthDayField,
  ChooseGender,
  Interests,
  NameField,
  UpdateAvatar,
  WellComeToMatcha,
} from '@/features/auth/sign-up/components/StructureSignUp/components';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { IStepSignUP } from '@/features/auth/sign-up/sign-up.type';
import { StructureSignUp } from '@/features/auth/sign-up/components/StructureSignUp';
import { UploadImage as UploadImageMultiple } from '@/features/auth/sign-up/components/StructureSignUp/components/UploadImage';
import { authActions } from '@/store/global/auth';
import { getAuthUser } from '@/store/global/auth/auth.slice';
import { router } from 'expo-router';
import { useGetProfileQuery } from '@/rtk-query';

interface Props {}

export type UserInfo = {
  name: string;
  birthday: string;
  gender: string;
  interests: number[];
  photos: string[];
  showGender: boolean;
};

const NotVerifyAccount = (props: Props) => {
  const dispatch = useDispatch();
  // Use both data and loading state
  // const { data: profileData, isLoading, error } = useGetProfileQuery();
  const profileData = useSelector(getAuthUser);

  // Remove the console.log that's causing the infinite rerenders
  // console.log({ profileData, isLoading, error });

  // Check verification status directly from profileData
  const isNotVerifyAccount = useMemo(
    () =>
      !profileData?.full_name ||
      !profileData?.birthdate ||
      !profileData?.gender,
    [profileData]
  );

  const [step, setStep] = useState<IStepSignUP | null>(null);
  const [user, setUser] = useState<UserInfo>({
    name: '',
    birthday: '',
    gender: '',
    interests: [],
    photos: [],
    showGender: false,
  });

  // Handle logout when profileData is not available after loading
  useEffect(() => {
    // Only proceed if we're done loading and no profile data is available
    if (!profileData) {
      console.log('Profile data failed to load - logging out');
      dispatch(authActions.logout());
      router.push('/(auth)/login');
    }
  }, [profileData, dispatch]);

  const handleBackButton = () => {
    switch (step) {
      case IStepSignUP.BIRTHDAY_FIELD:
        setStep(IStepSignUP.NAME_FIELD);
        break;
      case IStepSignUP.CHOOSE_GENDER:
        setStep(IStepSignUP.BIRTHDAY_FIELD);
        break;
      case IStepSignUP.INTERESTS:
        setStep(IStepSignUP.CHOOSE_GENDER);
        break;
      case IStepSignUP.UPLOAD_IMAGE:
        setStep(IStepSignUP.INTERESTS);
        break;
      case IStepSignUP.WELL_COME_TO_MATCHA:
        setStep(IStepSignUP.UPLOAD_IMAGE);
        break;
      default:
        setStep(IStepSignUP.NAME_FIELD);
    }
  };

  useEffect(() => {
    const initialStep = () => {
      if (!profileData) return null;

      switch (true) {
        case isNotVerifyAccount:
          return IStepSignUP.NAME_FIELD;
        case !profileData.profile_thumbnail?.length:
          return IStepSignUP.UPDATE_AVATAR;
        // Check for interests - using optional chaining in case structure varies
        case !profileData.interests?.length:
          return IStepSignUP.INTERESTS;
        case !profileData.photos?.length:
          return IStepSignUP.UPLOAD_IMAGE;
        default:
          return IStepSignUP.WELL_COME_TO_MATCHA;
      }
    };

    setStep(initialStep());
  }, [
    profileData?.full_name,
    profileData?.birthdate,
    profileData?.gender,
    profileData?.photos,
    profileData?.interests,
    profileData?.profile_thumbnail,
    isNotVerifyAccount,
    profileData,
  ]);

  return (
    <StructureSignUp
      handleBackButton={handleBackButton}
      isBackButton={
        step === IStepSignUP.NAME_FIELD ||
        step === IStepSignUP.INTERESTS ||
        step === IStepSignUP.UPDATE_AVATAR ||
        step === IStepSignUP.WELL_COME_TO_MATCHA
      }
    >
      {isNotVerifyAccount && (
        <>
          {step === IStepSignUP.NAME_FIELD && (
            <NameField
              {...props}
              setStep={setStep}
              setUser={setUser}
              user={user}
            />
          )}
          {step === IStepSignUP.BIRTHDAY_FIELD && (
            <BirthDayField
              {...props}
              setStep={setStep}
              setUser={setUser}
              user={user}
            />
          )}
          {step === IStepSignUP.CHOOSE_GENDER && (
            <ChooseGender
              {...props}
              step={step}
              setStep={setStep}
              setUser={setUser}
              user={user}
            />
          )}
        </>
      )}

      {step === IStepSignUP.UPDATE_AVATAR && (
        <UpdateAvatar
          {...props}
          setStep={setStep}
          setUser={setUser}
          user={user}
        />
      )}
      {step === IStepSignUP.INTERESTS && (
        <Interests
          {...props}
          step={step}
          setStep={setStep}
          setUser={setUser}
          user={user}
        />
      )}
      {step === IStepSignUP.UPLOAD_IMAGE && (
        <UploadImageMultiple
          {...props}
          setStep={setStep}
          setUser={setUser}
          user={user}
        />
      )}
      {step === IStepSignUP.WELL_COME_TO_MATCHA && (
        <WellComeToMatcha {...props} />
      )}
    </StructureSignUp>
  );
};

export default React.memo(NotVerifyAccount);
