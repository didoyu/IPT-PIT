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

        // 1. If no auth token, redirect to login
        if (!token) {
          router.replace("/login");
          return;
        }

        // 2. If user is a student, deny access and kick to student side
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

  // 🚪 LOGOUT METHOD
  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/login");
  };

  // Prevent flash rendering during validation check
  if (checkingAuth) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4f46e5",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: styles.tabBar,
        headerStyle: styles.globalHeader,
        headerShadowVisible: false,
        headerTitle: "", // Clears default text to prevent title overlapping
        
        // LEFT SIDE: Brand Logo + Web-style Admin Pill Badge
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

        // RIGHT SIDE: Welcome statement + Red Logout action container
        headerRight: () => (
          <View style={styles.headerRightContainer}>
            <Text style={styles.welcomeText}>
              Welcome, <Text style={styles.usernameBold}>{username}</Text>
            </Text>
            <TouchableOpacity onPress={handleLogout} activeOpacity={0.7} style={styles.logoutIconButton}>
              <FontAwesome name="sign-out" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ),
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
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    height: 64,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    gap: 8,
  },
  logoTextGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoMain: {
    fontSize: 18,
    fontWeight: "900",
    color: "#4f46e5",
    letterSpacing: -0.5,
  },
  logoSub: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0f172a",
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
    paddingRight: 20,
    gap: 12,
  },
  welcomeText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
  },
  usernameBold: {
    fontWeight: "800",
    color: "#0f172a",
  },
  logoutIconButton: {
    backgroundColor: "#fef2f2",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
});