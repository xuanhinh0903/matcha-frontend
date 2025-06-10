import '../global.css';

import * as Font from 'expo-font';

import { persistor, store } from '@/store/global';
import React, { useEffect, useState } from 'react';
import { Provider as StoreProvider } from 'react-redux';

import { APIProvider } from '@/api';
import RedisAdapter from '@/components/adapter/RedisAdapter/RedisAdapter';
import { LocationProvider } from '@/contexts/LocationContext';
import { GlobalMatchPopup } from '@/features/match/components/GlobalMatchPopup';
import { useOnlineStatus, useProtectedRoute } from '@/hooks';
import { Asset } from 'expo-asset';
import { SplashScreen } from 'expo-router';
import { Stack } from 'expo-router/stack';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistGate } from 'redux-persist/integration/react';

export { ErrorBoundary } from 'expo-router';
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Start font loading
        const fontPromise = Font.loadAsync({
          inter: require('@/assets/fonts/Inter.ttf'),
        });

        // Preload common images
        const imagePromise = Asset.loadAsync([
          require('@/assets/images/logo.png'),
          require('@/assets/images/splash-icon.png'),
        ]);

        // Load everything in parallel
        await Promise.all([fontPromise, imagePromise]);

        // Add small delay to ensure smooth transition
        await new Promise((resolve) => setTimeout(resolve, 25));

        // Hide splash screen
        await SplashScreen.hideAsync();
        setIsReady(true);
      } catch (e) {
        console.warn('Error loading app:', e);
        // Still hide splash screen and continue if there's an error
        await SplashScreen.hideAsync();
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }
  return (
    <Providers>
      <App />
    </Providers>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <StoreProvider store={store}>
        <GestureHandlerRootView style={styles.container}>
          <PersistGate loading={null} persistor={persistor}>
            <APIProvider>
              <LocationProvider>
                <React.Suspense fallback={null}>
                  <RedisAdapter />
                  {children}
                  <GlobalMatchPopup />
                  <FlashMessage position="top" />
                </React.Suspense>
              </LocationProvider>
            </APIProvider>
          </PersistGate>
        </GestureHandlerRootView>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

function App() {
  const { isAdmin } = useProtectedRoute();

  // Use the online status hook to track app state and update online status
  useOnlineStatus();

  if (isAdmin) {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="(admin)"
          options={{
            headerShown: false,
            freezeOnBlur: true,
          }}
        />
      </Stack>
    );
  }
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen
        name="(admin)"
        options={{
          headerShown: true,
          freezeOnBlur: true,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{ headerShown: false, freezeOnBlur: true }}
      />
      <Stack.Screen
        name="(call)"
        options={{
          headerShown: false,
          freezeOnBlur: true,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
