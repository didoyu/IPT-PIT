import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Image,
  TextInputProps, // ✅ Added here
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

const sections = Array.from(
  { length: 16 },
  (_, index) => `IT3R${index + 1}`
);

const currentYear = new Date().getFullYear();

const schoolYears = Array.from(
  { length: 5 },
  (_, index) => `${currentYear + index - 1}-${currentYear + index}`
);

function calculateAge(birthday: string): string {
  if (!birthday) return "";

  const today = new Date();
  const birthDate = new Date(birthday);

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age.toString();
}

// ✅ Restructured to support all native TextInput properties cleanly
type InputProps = TextInputProps & {
  label: string;
};

function Input({ label, ...props }: InputProps) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#94a3b8"
        style={[
          styles.input,
          props.editable === false && styles.disabledInput,
        ]}
        {...props}
      />
    </View>
  );
}

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [profilePicture, setProfilePicture] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    re_password: "",
    email: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    section: "",
    school_year: "",
    address: "",
    age: "",
    birthday: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("auth");
      if (token) {
        router.replace("/login");
      }
    };
    checkAuth();
  }, []);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your gallery."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfilePicture(result.assets[0]);
    }
  };

  const handleRegister = async () => {
    setError("");

    if (formData.password !== formData.re_password) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.section.trim() || formData.section.toLowerCase() === "n/a") {
      setError("Please enter a valid section.");
      return;
    }

    try {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (profilePicture) {
        const uriParts = profilePicture.uri.split(".");
        const fileExtension = uriParts[uriParts.length - 1] || "jpg";
        
        data.append("profile_picture", {
          uri: profilePicture.uri,
          name: `profile.${fileExtension}`,
          type: `image/${fileExtension === "png" ? "png" : "jpeg"}`,
        } as any);
      }

      const response = await api.post("register/", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert(
        "Registration Successful",
        response.data.message || "Please check your email to activate your account before logging in.",
        [
          {
            text: "Go to Sign In",
            onPress: () => router.replace("/login"),
          },
        ]
      );

    } catch (err: any) {
      console.log("REGISTER ERROR:", err.response?.data);
      const errorMsg = err.response?.data?.error || "Registration failed.";
      setError(errorMsg);
    }
  };

  return (
    <LinearGradient
      colors={["#f1f5f9", "#f8fafc", "#ffffff"]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Your Account</Text>
              <Text style={styles.subtitle}>
                Sign up with a secure account and join the student exam portal.
              </Text>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Username"
              placeholder="Username"
              value={formData.username}
              onChangeText={(text: string) => updateField("username", text)}
            />

            <Input
              label="Email"
              placeholder="Email address"
              keyboardType="email-address" // ✅ Error is gone!
              autoCapitalize="none"        // ✅ Error is gone!
              value={formData.email}
              onChangeText={(text: string) => updateField("email", text)}
            />

            <Input
              label="First Name"
              placeholder="First Name"
              value={formData.first_name}
              onChangeText={(text: string) => updateField("first_name", text)}
            />

            <Input
              label="Middle Name"
              placeholder="Middle Name (Optional)"
              value={formData.middle_name}
              onChangeText={(text: string) => updateField("middle_name", text)}
            />

            <Input
              label="Last Name"
              placeholder="Last Name"
              value={formData.last_name}
              onChangeText={(text: string) => updateField("last_name", text)}
            />

            <Input
              label="Birthday"
              placeholder="YYYY-MM-DD"
              value={formData.birthday}
              onChangeText={(text: string) => {
                updateField("birthday", text);
                updateField("age", calculateAge(text));
              }}
            />

            <Input
              label="Age"
              placeholder="Auto-calculated"
              value={formData.age ? `${formData.age} years` : ""}
              editable={false}
            />

            <Input
              label="Address"
              placeholder="Address"
              value={formData.address}
              onChangeText={(text: string) => updateField("address", text)}
            />

            <Input
              label="Section"
              placeholder={`Example: ${sections[0]}`}
              value={formData.section}
              onChangeText={(text: string) => updateField("section", text)}
            />

            <Input
              label="School Year"
              placeholder={schoolYears[0]}
              value={formData.school_year}
              onChangeText={(text: string) => updateField("school_year", text)}
            />

            <View style={styles.uploadBox}>
              <Text style={styles.label}>Profile Picture</Text>
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                <Text style={styles.uploadText}>Choose Image</Text>
              </TouchableOpacity>

              {profilePicture && (
                <Image
                  source={{ uri: profilePicture.uri }}
                  style={styles.preview}
                />
              )}
            </View>

            <Input
              label="Password"
              placeholder="Password"
              secureTextEntry
              value={formData.password}
              onChangeText={(text: string) => updateField("password", text)}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm Password"
              secureTextEntry
              value={formData.re_password}
              onChangeText={(text: string) => updateField("re_password", text)}
            />

            <TouchableOpacity activeOpacity={0.9} onPress={handleRegister}>
              <LinearGradient
                colors={["#4f46e5", "#c026d3"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Register Account</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.replace("/login")}>
                <Text style={styles.link}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scroll: { padding: 20, paddingVertical: 40 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 30,
    padding: 28,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    elevation: 8,
  },
  header: { marginBottom: 30, alignItems: "center" },
  title: { fontSize: 32, fontWeight: "800", color: "#0f172a", textAlign: "center" },
  subtitle: { marginTop: 10, fontSize: 15, lineHeight: 22, textAlign: "center", color: "#64748b" },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 8, color: "#334155" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 15,
    color: "#0f172a",
    backgroundColor: "#ffffff",
  },
  disabledInput: { backgroundColor: "#f8fafc" },
  uploadBox: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#cbd5e1",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
  },
  uploadButton: { backgroundColor: "#e2e8f0", paddingVertical: 14, borderRadius: 16, alignItems: "center", marginTop: 10 },
  uploadText: { color: "#334155", fontWeight: "700" },
  preview: { width: 100, height: 100, borderRadius: 20, marginTop: 20, alignSelf: "center" },
  button: { paddingVertical: 18, borderRadius: 24, alignItems: "center", marginTop: 10 },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
  errorBox: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", borderRadius: 18, padding: 16, marginBottom: 24 },
  errorText: { color: "#b91c1c", textAlign: "center", fontWeight: "600" },
  footer: { marginTop: 28, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { color: "#64748b", marginRight: 6 },
  link: { color: "#4f46e5", fontWeight: "700" },
});