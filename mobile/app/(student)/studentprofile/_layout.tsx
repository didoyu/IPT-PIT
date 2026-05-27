import { Stack } from "expo-router";

export default function StudentProfileNavigationLayout() {
  return (
    <Stack
      screenOptions={{
        // 🛑 Kills the nested stack header globally to eliminate double headers
        headerShown: false, 
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTintColor: "#7e22ce", 
        headerTitleStyle: {
          fontWeight: "900", 
        },
        headerShadowVisible: false, 
      }}
    >
      <Stack.Screen 
        name="studentProfile" 
        options={{ headerShown: false }} 
      />
      
      <Stack.Screen 
        name="studentDetails" 
        options={{ 
          title: "Academic Details" 
          // 🛑 REMOVED: headerShown: true (This was the double-header culprit!)
        }} 
      />
    </Stack>
  );
}
