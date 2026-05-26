import React, { useEffect, useState } from "react";
import { Tabs, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
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

        if (!token) {
          router.replace("/login");
          return;
        }

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
        tabBarActiveTintColor: "#7e22ce",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: styles.tabBar,
        headerStyle: styles.globalHeader,
        headerShadowVisible: false,
        headerTitle: "",
        
        // LEFT SIDE: Branded Logo Layout
        headerLeft: () => (
          <View style={styles.logoContainer}>
            <View style={styles.logoTextGroup}>
              <Text style={styles.logoMain}>EXAM</Text>
              <Text style={styles.logoSub}>SYS</Text>
            </View>
          </View>
        ),

        // RIGHT SIDE: Profile Greeting Only (Logout Removed)
        headerRight: () => (
          <View style={styles.headerRightContainer}>
            <Text style={styles.welcomeText}>
              Hi, <Text style={styles.usernameBold}>{username}</Text>
            </Text>
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
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  globalHeader: {
    backgroundColor: "#2e1065", 
    borderBottomWidth: 1,
    borderBottomColor: "#4c1d95", 
    height: 64,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
  },
  logoTextGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoMain: {
    fontSize: 18,
    fontWeight: "900",
    color: "#ffffff", 
    letterSpacing: -0.5,
  },
  logoSub: {
    fontSize: 18,
    fontWeight: "900",
    color: "#c084fc", 
    letterSpacing: -0.5,
  },
  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
  },
  welcomeText: {
    fontSize: 13,
    color: "#c084fc", 
    fontWeight: "500",
  },
  usernameBold: {
    fontWeight: "800",
    color: "#ffffff", 
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