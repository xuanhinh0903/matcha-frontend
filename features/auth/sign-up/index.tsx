import { useNavigation } from '@react-navigation/native';
import { View } from 'moti';
import React from 'react';

import { SignUpForm } from './components/sign-up-form';
import { SignUpStyleSheet } from './styles';

export const SignUpPage = () => {
  const navigation = useNavigation();

  const handleGoToLogin = () => {
    navigation.navigate('(auth)/login' as never);
  };

  return (
    <View style={SignUpStyleSheet.wrapper}>
      <SignUpForm goToLogin={handleGoToLogin} />
    </View>
  );
};
