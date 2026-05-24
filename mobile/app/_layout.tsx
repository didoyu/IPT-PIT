// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        // 🛡️ This shuts off the native header globally for the entire app
        headerShown: false,
      }}
    >
      {/* Explicitly defining the routes ensures smooth transitions */}
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="(student)" />
    </Stack>
  );
}