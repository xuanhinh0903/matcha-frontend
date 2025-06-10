import { Controller, useForm } from 'react-hook-form';
import { Image, Text, View } from 'react-native';
import { showErrorToast, showSuccessToast } from '@/helpers/toast.helper';

import { Button } from '@/components/ui/Button/matcha-button';
import { Input } from '@/components/ui/Input';
import { LoginFormStyleSheet } from './login-form.styles';
import React from 'react';
import { useSignInMutation } from '@/rtk-query';

export interface ISignIn {
  goToSignUp: () => void;
  goToHome: () => void;
}

export const LoginForm = ({ goToSignUp, goToHome }: ISignIn) => {
  const [mutate, { isLoading }] = useSignInMutation();

  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });
  console.log(process.env.EXPO_PUBLIC_API_URL);
  const onSubmit = async (data: any) => {
    if (!isValid) {
      return;
    }
    try {
      const response = await mutate(data);
      console.log('Login response:', response);
      if ('error' in response) {
        // Extract the error message from RTK Query error structure
        const errorData = response.error as any;
        showErrorToast(errorData);
        return;
      }

      showSuccessToast('Login successful');
      goToHome();
    } catch (error) {
      console.error('Login error:', error);
      showErrorToast(error);
    }
  };

  return (
    <View style={LoginFormStyleSheet.container}>
      <View style={LoginFormStyleSheet.logoContainer}>
        <Image
          style={LoginFormStyleSheet.logo}
          source={require('@/assets/images/logo.png')}
        />
      </View>

      <View style={LoginFormStyleSheet.formField}>
        <Text style={LoginFormStyleSheet.label}>Email:</Text>
        <Controller
          control={control}
          name="email"
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
              message: 'Enter a valid email address',
            },
          }}
          render={({ field: { onChange, value, onBlur } }) => (
            <>
              <Input
                value={value}
                onChangeText={(text) => onChange(text)}
                onBlur={onBlur}
                textContentType="emailAddress"
                placeholder="Enter your email"
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {errors.email && (
                <Text style={LoginFormStyleSheet.errorText}>
                  {errors.email.message}
                </Text>
              )}
            </>
          )}
        />
      </View>

      <View style={LoginFormStyleSheet.formField}>
        <Text style={LoginFormStyleSheet.label}>Password</Text>
        <Controller
          control={control}
          name="password"
          rules={{
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters long',
            },
          }}
          render={({ field: { onChange, value, onBlur } }) => (
            <>
              <Input
                value={value}
                onChangeText={(text) => onChange(text)}
                onBlur={onBlur}
                textContentType="password"
                placeholder="Enter your password"
                secureTextEntry
              />
              {errors.password && (
                <Text style={LoginFormStyleSheet.errorText}>
                  {errors.password.message}
                </Text>
              )}
            </>
          )}
        />
      </View>

      <Button
        text="Login"
        onPress={handleSubmit(onSubmit)}
        isLoading={isLoading}
      />
      <Text onPress={goToSignUp} style={LoginFormStyleSheet.anchor}>
        Don't have an account? Click here to sign up
      </Text>
    </View>
  );
};
