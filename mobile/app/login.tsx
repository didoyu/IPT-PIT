import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
  const checkAuth = async () => {
    const token = await AsyncStorage.getItem("auth");
    const isStaff = await AsyncStorage.getItem("isStaff");

    // 🔍 DEBUG LOGS: Watch your terminal when the app boots up!
    console.log("=== AUTO AUTH CHECK ===");
    console.log("Stored Token:", token);
    console.log("Stored isStaff Value:", isStaff);
    console.log("Stored isStaff Type:", typeof isStaff);

    if (token) {
      if (isStaff === "true") {
        router.replace("/(admin)/dashboard");
      } else {
        router.replace("/studentdashboard");
      }
    }
  };

  checkAuth();
}, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter both your username and password.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("login/", {
        username,
        password,
      });

      const { token, is_staff, username: dbUsername } = response.data;

      // Commit values securely to local persistence
      await AsyncStorage.setItem("auth", token);
      await AsyncStorage.setItem("user", dbUsername);
      await AsyncStorage.setItem("isStaff", String(is_staff));

      // Correctly route based on role flag response
      if (is_staff) {
        router.replace("/(admin)/dashboard");
      } else {
        router.replace("/(student)/studentdashboard");
      }
    } catch (err: any) {
  // 🔍 Add this line temporarily to see the real network response in your terminal:
  console.log("LOG IN DEBUG ERROR:", err.message, err.response?.data);

  const serverError = err.response?.data?.error;
  setError(serverError || "Invalid username or password. Please try again.");
} finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#f1f5f9", "#f8fafc", "#ffffff"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to continue to the student exam portal.
            </Text>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                placeholder="Enter your username"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity 
              onPress={handleLogin} 
              activeOpacity={0.9}
              disabled={isLoading}
            >
              <LinearGradient
                colors={["#4f46e5", "#c026d3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity
               onPress={() => router.push("/register")}
               disabled={isLoading}
            >
              <Text style={styles.signupText}>Sign up as a Student</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.bottomText}>Capstone Project 2026</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  header: { alignItems: "center", marginBottom: 32 },
  title: { fontSize: 34, fontWeight: "800", color: "#0f172a", textAlign: "center" },
  subtitle: { marginTop: 12, fontSize: 15, color: "#64748b", textAlign: "center", lineHeight: 22 },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: "700", color: "#334155" },
  input: {
    width: "100%",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#fff",
    fontSize: 15,
    color: "#0f172a",
  },
  button: { paddingVertical: 18, borderRadius: 24, alignItems: "center", marginTop: 10, minHeight: 58, justifyContent: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  errorBox: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", padding: 16, borderRadius: 18, marginBottom: 24 },
  errorText: { color: "#b91c1c", textAlign: "center", fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 32, paddingTop: 24, borderTopWidth: 1, borderTopColor: "#f1f5f9", flexWrap: "wrap" },
  footerText: { color: "#475569", fontSize: 14 },
  signupText: { color: "#4f46e5", fontWeight: "700", fontSize: 14, marginLeft: 4 },
  bottomText: { marginTop: 24, textAlign: "center", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#94a3b8" },
});