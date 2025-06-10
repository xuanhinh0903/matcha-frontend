import { Controller, useForm } from 'react-hook-form';
import { IStepSignUP, IUser } from '@/features/auth/sign-up/sign-up.type';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/Button/matcha-button';
import { Input } from '@/components/ui/Input';
import React from 'react';
import { styles } from './styles';

type FormData = {
  email: string;
  password: string;
};

interface IEmailField {
  setStep: React.Dispatch<React.SetStateAction<IStepSignUP>>;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  goToLogin?: () => void;
  loginDescription?: string;
}

export const EmailField = ({ setStep, onSubmit, isLoading, goToLogin, loginDescription }: IEmailField) => {
  const inputRef = useRef<TextInput>(null);

  const defaultValues = {
    email: '',
    password: '',
  };

  const {
    control,
    handleSubmit,
    formState: { isValid, errors, isDirty },
  } = useForm<FormData>({
    defaultValues,
  });

  return (
    <View style={styles.container}>
      <View>
        <View>
          <Text style={styles.title}>My account is</Text>
        </View>

        <View style={styles.formField}>
          <View>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
                validate: {
                  notEmpty: (value) =>
                    value.trim() !== '' || 'Email cannot be empty',
                  validDomain: (value) => {
                    const domain = value.split('@')[1];
                    return (
                      !domain ||
                      domain.indexOf('.') !== -1 ||
                      'Email must have a valid domain'
                    );
                  },
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => {
                return (
                  <Input
                    name="email"
                    errors={errors}
                    value={value}
                    placeholder="Insert your email"
                    onChangeText={(text) => {
                      onChange(text.toLowerCase());
                    }}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                );
              }}
            />
          </View>

          <View>
            <Text style={styles.label}>Password</Text>
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
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <Input
                    value={value}
                    placeholder="Insert your password"
                    textContentType="password"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    errors={errors}
                    name="password"
                  />
                </>
              )}
            />
          </View>
        </View>

        <Text style={styles.description}>
          Stay tuned for updates — exciting features are on the way! {'\n'}
          We're always working to improve your experience.{' '}
          {/* <Text style={styles.link}>Learn more about what's coming soon.</Text> */}
        </Text>

        
      </View>

      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleSubmit(onSubmit)}
        disabled={!isValid || !isDirty}
      >
        <Button
          text="CONTINUE"
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
        />
      </TouchableOpacity>

      {goToLogin && loginDescription && (
          <TouchableOpacity onPress={goToLogin}>
            <Text style={styles.loginLink}>{loginDescription}</Text>
          </TouchableOpacity>
        )}
    </View>
  );
};
