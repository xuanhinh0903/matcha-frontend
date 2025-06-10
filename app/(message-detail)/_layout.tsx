import React from 'react';
import { Stack } from 'expo-router';

export default function MessageDetailLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_bottom',
        presentation: 'transparentModal',
      }}
    />
  );
}
