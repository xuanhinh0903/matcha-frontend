import { Controller, useForm } from 'react-hook-form';
import { BackHandler, Text, TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/ui/Button/matcha-button';
import { IStepSignUP } from '@/features/auth/sign-up/sign-up.type';
import { Input } from '@/components/ui/Input';
import { UserInfo } from '@/app/(auth)/not-verify-account';
import { styles } from '../EmailField/styles';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';

type FormData = {
  email: string;
  name: string;
};

interface INameField {
  setStep: React.Dispatch<React.SetStateAction<IStepSignUP | null>>;
  setUser: React.Dispatch<React.SetStateAction<UserInfo>>;
  user: UserInfo;
}

export const NameField = ({ setStep, setUser, user }: INameField) => {
  const router = useRouter();

  const defaultValues = {
    name: user.name,
  };

  const {
    control,
    handleSubmit,
    formState: { isValid, errors, isDirty },
  } = useForm<FormData>({
    defaultValues,
  });

  // Handle device back button press
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // Navigate to login screen when back button is pressed
        router.push('/(auth)/login');
        // Return true to prevent default back behavior
        return true;
      };

      // Add back press listener
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // Clean up the event listener when component is unfocused
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [router])
  );

  const onSubmit = (data: FormData) => {
    setUser({
      ...user,
      name: data.name,
    });
    setStep(IStepSignUP.BIRTHDAY_FIELD);
  };

  return (
    <View style={styles.container}>
      <View>
        <View>
          <Text style={styles.title}>My name is</Text>
        </View>

        <View>
          <Controller
            control={control}
            name="name"
            rules={{
              required: 'Name is required',
              minLength: {
                value: 3,
                message: 'Name must be at least 5 characters long',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => {
              return (
                <Input
                  name="name"
                  errors={errors}
                  value={value}
                  placeholder="Insert your name"
                  onChangeText={(text) => {
                    onChange(text);
                  }}
                  onBlur={onBlur}
                  autoCapitalize="none"
                />
              );
            }}
          />
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
          isLoading={false}
        />
      </TouchableOpacity>
    </View>
  );
};
