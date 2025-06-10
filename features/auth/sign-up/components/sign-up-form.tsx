import { BirthDayField, ChooseGender, Interests, NameField, WellComeToMatcha, } from './StructureSignUp/components';
import { Controller, useForm } from 'react-hook-form';
import { IStepSignUP, IUser } from '../sign-up.type';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { showErrorToast, showSuccessToast } from '@/helpers/toast.helper';
import { useGetProfileQuery, useSignInMutation, useSignUpMutation } from '@/rtk-query';

import { EmailField } from './StructureSignUp/components/EmailField';
import { StructureSignUp } from './StructureSignUp';
import { UploadImage } from './StructureSignUp/components/UploadImage';

export interface ISignUp {
  goToLogin: () => void;
}



export const SignUpForm = ({ goToLogin }: ISignUp) => {
  const [mutate, { isLoading }] = useSignUpMutation({
    fixedCacheKey: 'signUp',
  });

  const [signIn, { isLoading: isLoadingSignIn }] = useSignInMutation({
    fixedCacheKey: 'signIn',
  });

  const [step, setStep] = useState(IStepSignUP.EMAIL_FIELD);

  const [user, setUser] = useState<IUser | null>({
    name: '',
    lastName: '',
    age: '',
    email: '',
    password: '',
  });

  
  const defaultValues = {
    name: '',
    lastName: '',
    age: '',
    email: '',
    password: '',
  };

  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues,
  });

  const onSubmit = async (data: any) => {
    if (!data?.email || !data?.password) {
      showErrorToast('Email and password are required');
      return;
    }

    try {
      const body = {
        email: data.email,
        password: data.password
      };

      const response = await mutate(body);
      if ('error' in response) {
        showErrorToast(response.error);
        return;
      }

      const responseSignIn = await signIn(data);
      if ('error' in responseSignIn) {
        showErrorToast(responseSignIn.error);
        return;
      }
      showSuccessToast('Registration successful');
      setStep(IStepSignUP.NAME_FIELD);
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <StructureSignUp>
      {step === IStepSignUP.EMAIL_FIELD && <EmailField setStep={setStep} onSubmit={onSubmit} isLoading={isLoading} goToLogin={goToLogin} loginDescription="Đã có tài khoản? Đăng nhập" />}
    </StructureSignUp>
  );
};
