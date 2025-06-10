import { Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState } from 'react';

import { Button } from '@/components/ui/Button/matcha-button';
import { IStepSignUP } from '@/features/auth/sign-up/sign-up.type';
import { styles } from './styles';

interface BirthDayFieldProps {
  setStep: React.Dispatch<React.SetStateAction<IStepSignUP | null>>;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  user: any;
}

interface BirthdayState {
  year: string;
  month: string;
  day: string;
}

export const BirthDayField = ({ setStep, setUser, user }: BirthDayFieldProps) => {
  const [birthday, setBirthday] = useState<BirthdayState>(() => {
    if (user?.birthday) {
      const [year, month, day] = user.birthday.split('-');
      return { year, month, day };
    }
    return { year: '', month: '', day: '' };
  });
  const [errors, setErrors] = useState<BirthdayState>({ year: '', month: '', day: '' });
  const monthRef = useRef<TextInput>(null);
  const dayRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);
  
  const validateYear = (year: string): string => {
    if (year.length === 4) {
      const yearNum = parseInt(year);
      if (yearNum < 1975) {
        return 'Year must be 1975 or later';
      }
    }
    return '';
  };

  const validateMonth = (month: string): string => {
    if (month.length === 2) {
      const monthNum = parseInt(month);
      if (monthNum < 1 || monthNum > 12) {
        return 'Month must be between 1 and 12';
      }
    }
    return '';
  };

  const validateDay = (day: string, month: string): string => {
    if (day.length === 2 && month.length === 2) {
      const dayNum = parseInt(day);
      const monthNum = parseInt(month);
      
      // Get the last day of the month
      const lastDay = new Date(2024, monthNum, 0).getDate();
      
      if (dayNum < 1 || dayNum > lastDay) {
        return `Day must be between 1 and ${lastDay}`;
      }
    }
    return '';
  };

  const isValid = birthday.year.length === 4 && 
                 birthday.month.length === 2 && 
                 birthday.day.length === 2 &&
                 !errors.year && 
                 !errors.month && 
                 !errors.day;

  const handleContinue = () => {
    if (isValid) {
      const birthdayString = `${birthday.year}-${birthday.month}-${birthday.day}`;
      setUser((prev: any)=> ({...prev, birthday: birthdayString}))
      setStep(IStepSignUP.CHOOSE_GENDER)
    } else {
      console.log('Invalid date');
    }
  };

  const handleBackspace = (part: keyof BirthdayState, text: string) => {
    if (text.length === 0) {
      if (part === 'day') {
        monthRef.current?.focus();
      } else if (part === 'month') {
        yearRef.current?.focus();
      }
    }
  };

  const handleInputChange = (part: keyof BirthdayState, text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setBirthday(prevState => ({ ...prevState, [part]: numericText }));

    // Move focus to previous field if current field becomes empty
    if (numericText.length === 0) {
      if (part === 'day') {
        monthRef.current?.focus();
      } else if (part === 'month') {
        yearRef.current?.focus();
      }
    }

    // Validate the input
    let error = '';
    if (part === 'year') {
      error = validateYear(numericText);
    } else if (part === 'month') {
      error = validateMonth(numericText);
    } else if (part === 'day') {
      error = validateDay(numericText, birthday.month);
    }
    
    setErrors(prevState => ({ ...prevState, [part]: error }));

    // Auto-focus next field if valid
    if (part === 'year' && numericText.length === 4 && !error) {
      monthRef.current?.focus();
    } else if (part === 'month' && numericText.length === 2 && !error) {
      dayRef.current?.focus();
    } else if (part === 'day' && numericText.length === 2 && !error) {
      Keyboard.dismiss();
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>My birthday is</Text>

        <View style={styles.dateInputRowContainer}>
          <TextInput
            ref={yearRef}
            style={[styles.input, styles.yearInput, errors.year ? styles.inputError : null]}
            placeholder="YYYY"
            placeholderTextColor={styles.placeholderText.color}
            value={birthday.year}
            onChangeText={(text) => handleInputChange('year', text)}
            onKeyPress={(e) => {
              if (e.nativeEvent.key === 'Backspace') {
                handleBackspace('year', birthday.year);
              }
            }}
            keyboardType="number-pad"
            maxLength={4}
            returnKeyType="next"
            onSubmitEditing={() => monthRef.current?.focus()}
          />
          <Text style={styles.separator}>/</Text>
          <TextInput
            ref={monthRef}
            style={[styles.input, styles.monthInput, errors.month ? styles.inputError : null]}
            placeholder="MM"
            placeholderTextColor={styles.placeholderText.color}
            value={birthday.month}
            onChangeText={(text) => handleInputChange('month', text)}
            onKeyPress={(e) => {
              if (e.nativeEvent.key === 'Backspace') {
                handleBackspace('month', birthday.month);
              }
            }}
            keyboardType="number-pad"
            maxLength={2}
            returnKeyType="next"
            onSubmitEditing={() => dayRef.current?.focus()}
          />
          <Text style={styles.separator}>/</Text>
          <TextInput
            ref={dayRef}
            style={[styles.input, styles.dayInput, errors.day ? styles.inputError : null]}
            placeholder="DD"
            placeholderTextColor={styles.placeholderText.color}
            value={birthday.day}
            onChangeText={(text) => handleInputChange('day', text)}
            onKeyPress={(e) => {
              if (e.nativeEvent.key === 'Backspace') {
                handleBackspace('day', birthday.day);
              }
            }}
            keyboardType="number-pad"
            maxLength={2}
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
        </View>

        {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}
        {errors.month && <Text style={styles.errorText}>{errors.month}</Text>}
        {errors.day && <Text style={styles.errorText}>{errors.day}</Text>}

        <Text style={styles.description}>Your age will be public</Text>
      </View>

      <TouchableOpacity
        style={styles.continueButtonContainer}
        onPress={handleContinue}
        disabled={!isValid}
      >
        <Button
          text="CONTINUE"
          onPress={handleContinue}
          isDisable={!isValid}
        />
      </TouchableOpacity>
    </View>
  );
};
