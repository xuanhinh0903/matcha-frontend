import React from 'react';
import MessagesScreen from '../../features/messages';
import { useIsFocused } from '@react-navigation/native';

export default function Messages() {
  const isFocused = useIsFocused();
  if (!isFocused) {
    return null;
  }
  return <MessagesScreen />;
}
