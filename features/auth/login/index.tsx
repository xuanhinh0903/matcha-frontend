import { useRouter } from 'expo-router';
import { View } from 'moti';
import React, { useCallback } from 'react';

import { LoginForm } from './components/login-form';
import { SignInStyleSheet } from './styles';

export const LoginPage = () => {
  const router = useRouter();

  const goToSignUp = useCallback(() => {
    router.push('./signup');
  }, [router]);

  const goToHome = useCallback(() => {
    router.push('/(tabs)');
  }, [router]);

  console.log('LoginPage', process.env.EXPO_PUBLIC_API_URL);
  return (
    <View style={SignInStyleSheet.wrapper}>
      <LoginForm goToSignUp={goToSignUp} goToHome={goToHome} />
    </View>
  );
};
