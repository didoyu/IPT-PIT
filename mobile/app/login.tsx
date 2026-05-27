import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ImageBackground, // ✅ Swapped Image for ImageBackground
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("auth");
      const isStaff = await AsyncStorage.getItem("isStaff");

      if (token) {
        if (isStaff === "true") {
          router.replace("/(admin)/dashboard");
        } else {
          router.replace("/(student)/studentdashboard");
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
      console.log('BACKEND RESPONSE:', JSON.stringify(response.data));

      const { token, is_staff, username: dbUsername } = response.data;

      await AsyncStorage.setItem("auth", token);
      await AsyncStorage.setItem("user", dbUsername);
      await AsyncStorage.setItem("isStaff", String(is_staff));

      if (is_staff) {
        router.replace("/(admin)/dashboard");
      } else {
        router.replace("/(student)/studentdashboard");
      }
    } catch (err: any) {
      console.log("LOG IN DEBUG ERROR:", err.message, err.response?.data);
      const serverError = err.response?.data?.error;
      setError(serverError || "Invalid username or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Base container holding the dark purple gradient
    <LinearGradient
      colors={["#2e1065", "#3b0764", "#1e1b4b"]} 
      style={styles.rootContainer}
    >
      {/* 📸 FIXED: Uses ImageBackground with explicit sizing to stretch flawlessly across all phone screens */}
      <ImageBackground 
        source={require("../assets/images/gwapo.jpg")} 
        style={styles.backgroundImage}
        resizeMode="cover"
        imageStyle={{ opacity: 0.25 }} // Applies opacity strictly to the image asset layer
      >
        <SafeAreaView style={styles.safeAreaContainer}>
          <View style={styles.card}>
            
            <View style={styles.header}>
              <Text style={styles.title}>Student Exam Portal</Text>
              <Text style={styles.subtitle}>
                Sign in to access your dashboard.
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
                <View style={styles.passwordContainer}>
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword} 
                    style={styles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={22} 
                      color="#94a3b8" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleLogin} 
                activeOpacity={0.9}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={["#7e22ce", "#9333ea"]}
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
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity
                 onPress={() => router.push("/register")}
                 disabled={isLoading}
              >
                <Text style={styles.signupText}>Sign up as a Student</Text>
              </TouchableOpacity>
            </View>
            
          </View>
        </SafeAreaView>
      </ImageBackground>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  // Added to handle full-screen stretch behavior cleanly
  backgroundImage: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  safeAreaContainer: {
    flex: 1, 
    justifyContent: "center", 
    paddingHorizontal: 20
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.96)", 
    borderRadius: 28,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(126, 34, 206, 0.15)", 
  },
  header: { alignItems: "center", marginBottom: 32 },
  title: { fontSize: 32, fontWeight: "800", color: "#0f172a", textAlign: "center" },
  subtitle: { marginTop: 12, fontSize: 15, color: "#64748b", textAlign: "center", lineHeight: 22 },
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: "700", color: "#334155" },
  input: {
    width: "100%",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12, 
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    fontSize: 15,
    color: "#0f172a",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0f172a",
  },
  eyeIcon: {
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  button: { paddingVertical: 16, borderRadius: 24, alignItems: "center", marginTop: 10, minHeight: 54, justifyContent: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  errorBox: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", padding: 16, borderRadius: 18, marginBottom: 24 },
  errorText: { color: "#b91c1c", textAlign: "center", fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 32, paddingTop: 24, borderTopWidth: 1, borderTopColor: "#f1f5f9", flexWrap: "wrap" },
  footerText: { color: "#475569", fontSize: 14 },
  signupText: { color: "#7e22ce", fontWeight: "700", fontSize: 14 }, 
});
