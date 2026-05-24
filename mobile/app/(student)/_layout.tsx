import React, { useEffect, useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function StudentLayout() {
  const router = useRouter();
  const [username, setUsername] = useState("Guest");
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 🛡️ STUDENT PROTECTED ROUTE GATEWAY
  useEffect(() => {
    const checkStudentAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("auth");
        const isStaff = await AsyncStorage.getItem("isStaff");
        const storedUser = await AsyncStorage.getItem("user");

        // 1. If no auth token, redirect to login
        if (!token) {
          router.replace("/login");
          return;
        }

        // 2. If user is staff, route them back up to administrative dashboards
        if (isStaff === "true") {
          Alert.alert("Access Denied", "Administrators cannot directly look into student testing modules.");
          router.replace("/(admin)/dashboard");
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

    checkStudentAuth();
  }, []);

  // 🚪 LOGOUT METHOD
  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/login");
  };

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
        headerTitle: "",
        
        // LEFT SIDE: Your branded web logo replica
        headerLeft: () => (
          <View style={styles.logoContainer}>
            <Text style={styles.logoMain}>EXAM</Text>
            <Text style={styles.logoSub}>SYS</Text>
          </View>
        ),

        // RIGHT SIDE: Student Info Greeting & Logout Icon Box
        headerRight: () => (
          <View style={styles.headerRightContainer}>
            <Text style={styles.welcomeText}>
              Hi, <Text style={styles.usernameBold}>{username}</Text>
            </Text>
            <TouchableOpacity onPress={handleLogout} activeOpacity={0.7} style={styles.logoutIconButton}>
              <FontAwesome name="sign-out" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        ),
      }}
    >
      <Tabs.Screen
        name="studentdashboard"
        options={{
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color }) => <FontAwesome name="dashboard" size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="examList"
        options={{
          tabBarLabel: "Exams",
          tabBarIcon: ({ color }) => <FontAwesome name="book" size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="studentprofile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={20} color={color} />,
        }}
      />

      <Tabs.Screen
        name="take-exam/[id]"
        options={{
          href: null,
          headerShown: false, // Hides header entirely during active tests
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
    paddingLeft: 24,
  },
  logoMain: {
    fontSize: 20,
    fontWeight: "900",
    color: "#4f46e5",
    letterSpacing: -0.5,
  },
  logoSub: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 24,
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
    paddingBottom: 10,
    paddingTop: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
});