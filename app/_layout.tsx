import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '../contexts/AuthContext';
import { Colors } from '../constants/colors';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => { SplashScreen.hideAsync(); }, []);

  return (
    <AuthProvider>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="product/[id]" options={{ animation: 'slide_from_right', headerShown: false }} />
        <Stack.Screen name="product/add" options={{ animation: 'slide_from_bottom', headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="product/scan" options={{ animation: 'slide_from_bottom', headerShown: false, presentation: 'fullScreenModal' }} />
      </Stack>
    </AuthProvider>
  );
}
