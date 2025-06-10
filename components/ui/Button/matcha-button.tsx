import { LinearGradient } from 'expo-linear-gradient';
import React, { type FC } from 'react';
import {
  type GestureResponderEvent,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { ButtonStyleSheet } from './styles';

export interface IButton {
  styles?: Record<string, any>;
  maxWidth?: number;
  text: string;
  colors?: [string, string, ...string[]];
  onPress?: (event: GestureResponderEvent) => void;
  isDisable?: boolean;
  isLoading?: boolean;
}

export const Button: FC<IButton> = ({
  styles,
  maxWidth,
  text,
  onPress,
  colors = ['#46ec62', '#35c848'],
  isDisable = false,
  isLoading = false,
}) => {
  const buttonWrapper = {
    maxWidth,
    ...styles,
  };

  // Define gray colors for disabled state as a tuple
  const disabledColors: [string, string] = ['#cccccc', '#999999'];

  return (
    <TouchableOpacity onPress={onPress} disabled={isDisable || isLoading}>
      <LinearGradient
        colors={isDisable ? disabledColors : colors}
        style={[ButtonStyleSheet.wrapper, buttonWrapper]}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[ButtonStyleSheet.content]}>{text}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};
