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
      {/* 🦙 Register your chatbot route as a modal overlay over everything */}
      <Stack.Screen 
        name="chatbotmobile" 
        options={{ 
          headerShown: true, 
          title: "Portal Assistant", 
          presentation: "modal" // 👈 Makes it slide up smoothly from the bottom
        }} 
      />
    </Stack>
  );
}
