import React from 'react';
import { type FC } from 'react';
import {
  type NativeSyntheticEvent,
  TextInput,
  type TextInputFocusEventData,
  KeyboardTypeOptions,
  View,
  Text,
} from 'react-native';

import { InputStyleSheet } from './styles';
import { FieldErrors } from 'react-hook-form';

export interface IInput {
  editable?: boolean;
  value?: string;
  textContentType?: 'emailAddress' | 'password';
  placeholder?: string;
  onChangeText?: (text: string) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  secureTextEntry?: boolean;
  errors?: FieldErrors<{
    email: string;
    password: string;
  }>;
  name?: string;
}

export const Input: FC<IInput> = ({
  editable,
  placeholder,
  value,
  onChangeText,
  onBlur,
  textContentType,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
  name,
  errors,
}) => {
  return (
    <View>
      <TextInput
        style={InputStyleSheet.input}
        editable={editable}
        value={`${value}`}
        onChangeText={onChangeText}
        onBlur={onBlur}
        textContentType={textContentType}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
      />
      {name && errors?.[name as keyof typeof errors] && (
        <Text style={InputStyleSheet.errorText}>{errors?.[name as keyof typeof errors]?.message}</Text>
      )}
    </View>
  );
};
