import { Stack } from "expo-router";

export default function StudentProfileNavigationLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#ffffff" },
        headerTintColor: "#0f172a",
        headerTitleStyle: { fontWeight: "800" },
        headerShadowVisible: false,
      }}
    >
      {/* 1. This acts as your main profile landing tab view */}
      <Stack.Screen 
        name="studentProfile" 
        options={{ headerShown: false }} 
      />
      
      {/* 2. This is the sub-screen that slides into view when pushed */}
      <Stack.Screen 
        name="studentDetails" 
        options={{ title: "Academic Details" }} 
      />
    </Stack>
  );
}