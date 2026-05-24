import { Stack } from "expo-router";

export default function ProfileNavigationLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTintColor: "#0f172a",
        headerTitleStyle: {
          fontWeight: "800",
        },
        headerShadowVisible: false, // Clean look without harsh borders
      }}
    >
      {/* The main hub doesn't need a top header since we styled a beautiful custom one */}
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />
      
      {/* The sub-details screen will automatically show a native back arrow to return to index */}
      <Stack.Screen 
        name="details" 
        options={{ title: "Account Details" }} 
      />
    </Stack>
  );
}