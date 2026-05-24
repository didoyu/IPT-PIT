import { Tabs } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { View, Text, StyleSheet } from "react-native";

export default function StudentLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4f46e5",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: styles.tabBar,
        
        // --- MATCHING YOUR WEB REACT NAVBAR STYLES ---
        headerStyle: styles.globalHeader,
        headerShadowVisible: false, // Disables default platform shadow curves
        headerTitle: "", // Clears default text so it won't collide with the logo
        
        // LEFT SIDE: Your branded web logo replica
        headerLeft: () => (
          <View style={styles.logoContainer}>
            <Text style={styles.logoMain}>EXAM</Text>
            <Text style={styles.logoSub}>SYS</Text>
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
          headerShown: false, // Hides the header entirely during live exams
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Web sticky navbar translation
  globalHeader: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0", // border-slate-200
    height: 64,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 24, // px-6 alignment equivalent
  },
  logoMain: {
    fontSize: 20,
    fontWeight: "900", // font-black
    color: "#4f46e5",  // text-indigo-600
    letterSpacing: -0.5, // tracking-tight
  },
  logoSub: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0f172a",  // text-slate-900
    letterSpacing: -0.5,
  },
  tabBar: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    height: 64,
    paddingBottom: 10,
    paddingTop: 8,
  },
});