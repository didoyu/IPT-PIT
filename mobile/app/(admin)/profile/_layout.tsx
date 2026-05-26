import { Stack } from "expo-router";

export default function ProfileNavigationLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: "#ffffff", // Keeps the background clean and bright above your forms
        },
        // 💜 BRAND SYNC: Changed from dark slate (#0f172a) to your active Deep Purple accent
        headerTintColor: "#7e22ce", 
        headerTitleStyle: {
          fontWeight: "900", // Pushed to extra bold to stay consistent with your layout headers
        },
        headerShadowVisible: false, 
      }}
    >
      {/* The main hub doesn't need a top header since we styled a beautiful custom one */}
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />
      
      {/* The sub-details screen will automatically show a matching purple back arrow */}
      <Stack.Screen 
        name="details" 
        options={{ title: "Account Details" }} 
      />
    </Stack>
  );
}