import {
  GFSNeohellenic_400Regular,
  GFSNeohellenic_700Bold,
  useFonts,
} from '@expo-google-fonts/gfs-neohellenic';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LoadingScreen } from '@/components/splash/loading-screen';
import { BillingProvider } from '@/game/billing';
import { hydratePayout } from '@/game/payout';
import { hydratePlayer } from '@/game/player';
import { hydratePurchases } from '@/game/purchases';

SplashScreen.preventAutoHideAsync().catch(() => {});

type Phase = 'loading' | 'app';

export default function RootLayout() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [hydrated, setHydrated] = useState(false);
  const [fontsLoaded] = useFonts({
    GFSNeohellenic_400Regular,
    GFSNeohellenic_700Bold,
  });

  // Restore the saved balance / free spins / cooldowns before anything reads
  // the player store.
  useEffect(() => {
    Promise.all([hydratePlayer(), hydratePurchases(), hydratePayout()]).finally(() =>
      setHydrated(true),
    );
  }, []);

  // The native splash stays up until the font is ready, so the loading screen
  // never flashes in a fallback face first.
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  const handleLoadingDone = useCallback(() => setPhase('app'), []);

  if (!fontsLoaded || !hydrated) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BillingProvider>
          <StatusBar style="light" />
          {phase === 'loading' ? (
            <LoadingScreen onDone={handleLoadingDone} />
          ) : (
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000000' } }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="game" />
              <Stack.Screen name="leaderboard" />
              <Stack.Screen name="daily-bonus" />
              <Stack.Screen name="wheel" />
              <Stack.Screen name="shop" />
              <Stack.Screen name="exchange" />
              <Stack.Screen name="add-payout-method" />
              <Stack.Screen
                name="connect-payout"
                options={{ presentation: 'transparentModal', animation: 'fade' }}
              />
              <Stack.Screen
                name="maintenance"
                options={{ presentation: 'transparentModal', animation: 'fade' }}
              />
              <Stack.Screen
                name="settings"
                options={{ presentation: 'transparentModal', animation: 'fade' }}
              />
            </Stack>
          )}
        </BillingProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
