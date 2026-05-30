import '../global.css';

import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { AuthProvider } from '@/context/auth';
import { LikesProvider } from '@/context/likes';
import { useAuth } from '@/context/auth';

function AppContent() {
  const { isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#09A5A0" />
      </View>
    );
  }

  return (
    <Stack initialRouteName="landing">
      <Stack.Screen name="landing" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <AuthProvider>
        <LikesProvider>
          <AppContent />
        </LikesProvider>
      </AuthProvider>
      <StatusBar style="dark" backgroundColor="#ffffff" />
    </ThemeProvider>
  );
}
