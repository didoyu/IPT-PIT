import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export default function AdminLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4f46e5",   // Active indigo color from your palette
        tabBarInactiveTintColor: "#64748b", // Slate gray for inactive tabs
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e2e8f0",
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: "#ffffff",
        },
        headerTintColor: "#0f172a",
        headerTitleStyle: {
          fontWeight: "800",
        },
      }}
    >
      {/* 1. Admin Home / Dashboard Landing */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="dashboard" size={22} color={color} />
          ),
        }}
      />

      {/* 2. Setup New Exam Tab */}
      <Tabs.Screen
        name="create-exam"
        options={{
          title: "Setup Exam",
          tabBarLabel: "New Exam",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="plus-circle" size={22} color={color} />
          ),
        }}
      />

      {/* 3. Results Overview Tab */}
      <Tabs.Screen
        name="results"
        options={{
          title: "Exam Results",
          tabBarLabel: "Results",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="table" size={22} color={color} />
          ),
        }}
      />

      {/* 4. Admin Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "My Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={22} color={color} />
          ),
        }}
      />

      {/* 5. HIDDEN ROUTE: Add Questions Screen
          This keeps the route valid so you can type router.push() to it, 
          but hides the button icon visually from the tab bar. */}
      <Tabs.Screen
        name="add-question/[examId]"
        options={{
          title: "Manage Questions",
          href: null, // 👈 Hides the tab button completely
        }}
      />
    </Tabs>
  );
}