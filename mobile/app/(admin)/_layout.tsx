import React, { useEffect, useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AdminLayout() {
  const router = useRouter();
  const [username, setUsername] = useState("Admin");
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 🛡️ ADMIN PROTECTED ROUTE GATEWAY
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("auth");
        const isStaff = await AsyncStorage.getItem("isStaff");
        const storedUser = await AsyncStorage.getItem("user");

        if (!token) {
          router.replace("/login");
          return;
        }

        if (isStaff !== "true") {
          Alert.alert("Unauthorized", "Access denied. Student accounts cannot view administrator panels.");
          router.replace("/(student)/studentdashboard");
          return;
        }

        if (storedUser) {
          setUsername(storedUser);
        }
        setCheckingAuth(false);
      } catch (error) {
        console.error(error);
        router.replace("/login");
      }
    };

    checkAdminAuth();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/login");
  };

  if (checkingAuth) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7e22ce" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#7e22ce", // Deep purple interactive focus indicator
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: styles.tabBar,
        headerStyle: styles.globalHeader,
        headerShadowVisible: false,
        headerTitle: "", 
        
        // LEFT SIDE: Synchronized Web Branding (White + Purple-400 Split)
        headerLeft: () => (
          <View style={styles.logoContainer}>
            <View style={styles.logoTextGroup}>
              <Text style={styles.logoMain}>EXAM</Text>
              <Text style={styles.logoSub}>SYS</Text>
            </View>
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>ADMIN</Text>
            </View>
          </View>
        ),

        // RIGHT SIDE: Clean Mobile-first action button container (Welcome string hidden for viewport spacing)
        
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color }) => <FontAwesome name="dashboard" size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="create-exam"
        options={{
          tabBarLabel: "New Exam",
          tabBarIcon: ({ color }) => <FontAwesome name="plus-circle" size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="results"
        options={{
          tabBarLabel: "Results",
          tabBarIcon: ({ color }) => <FontAwesome name="table" size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="add-question/[examId]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  globalHeader: {
    backgroundColor: "#2e1065", // Matches Tailwind's bg-purple-950 exactly
    borderBottomWidth: 1,
    borderBottomColor: "#4c1d95", // Matches border-purple-900 depth
    height: 64,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    gap: 8,
  },
  logoTextGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoMain: {
    fontSize: 18,
    fontWeight: "900",
    color: "#ffffff", // Pure white text match
    letterSpacing: -0.5,
  },
  logoSub: {
    fontSize: 18,
    fontWeight: "900",
    color: "#c084fc", // Matches Tailwind's text-purple-400
    letterSpacing: -0.5,
  },
  adminBadge: {
    backgroundColor: "#ef4444", 
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 99,
  },
  adminBadgeText: {
    color: "#ffffff",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
  },
  logoutIconButton: {
    backgroundColor: "rgba(76, 29, 149, 0.4)", // Translucent deep purple background element matching web
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
});
