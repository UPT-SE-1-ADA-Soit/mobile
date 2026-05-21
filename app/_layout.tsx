import '../global.css';

import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '@/context/auth';
import { LikesProvider } from '@/context/likes';

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthProvider>
        <LikesProvider>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
          </Stack>
        </LikesProvider>
      </AuthProvider>
      <StatusBar style="dark" backgroundColor="#ffffff" />
    </ThemeProvider>
  );
}
