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
  ActivityIndicator,
  ImageBackground,
  Modal,
  FlatList,
  TextInputProps,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

// Selection Data Constants
const sections = Array.from({ length: 16 }, (_, index) => `IT3R${index + 1}`);
const currentYear = new Date().getFullYear();
const schoolYears = Array.from({ length: 5 }, (_, index) => `${currentYear + index - 1}-${currentYear + index}`);

const months = [
  { label: "Jan", value: "01" },
  { label: "Feb", value: "02" },
  { label: "Mar", value: "03" },
  { label: "Apr", value: "04" },
  { label: "May", value: "05" },
  { label: "Jun", value: "06" },
  { label: "Jul", value: "07" },
  { label: "Aug", value: "08" },
  { label: "Sep", value: "09" },
  { label: "Oct", value: "10" },
  { label: "Nov", value: "11" },
  { label: "Dec", value: "12" },
];
const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));
const birthYears = Array.from({ length: 50 }, (_, i) => String(currentYear - 16 - i)); 

function calculateAge(birthday: string): string {
  if (!birthday) return "";
  const today = new Date();
  const birthDate = new Date(birthday);
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age.toString() : "";
}

type InputProps = TextInputProps & {
  label: string;
  containerStyle?: object;
};

function Input({ label, containerStyle, ...props }: InputProps) {
  return (
    <View style={[styles.inputGroup, containerStyle]}>
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

type SelectInputProps = {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  iconName: "calendar-outline" | "chevron-down"; // Dynamic icon selection typing
  containerStyle?: object;
};

function SelectInput({ label, value, placeholder, onPress, iconName, containerStyle }: SelectInputProps) {
  return (
    <View style={[styles.inputGroup, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.selectTrigger}>
        <Text style={[styles.selectTriggerText, !value && { color: "#94a3b8" }]}>
          {value || placeholder}
        </Text>
        <Ionicons name={iconName} size={18} color="#64748b" />
      </TouchableOpacity>
    </View>
  );
}

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  
  // Modal States
  const [activeModal, setActiveModal] = useState<"section" | "school_year" | "birthday" | null>(null);
  
  // Temporary Birthday Selections within Modal Sheet
  const [tempMonth, setTempMonth] = useState("01");
  const [tempDay, setTempDay] = useState("01");
  const [tempYear, setTempYear] = useState(birthYears[0]);

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
        router.replace("/(student)/studentdashboard");
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

  const confirmBirthdaySelection = () => {
    const formattedDate = `${tempYear}-${tempMonth}-${tempDay}`;
    updateField("birthday", formattedDate);
    updateField("age", calculateAge(formattedDate));
    setActiveModal(null);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow access to your gallery.");
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
    if (
      !formData.username.trim() || 
      !formData.email.trim() || 
      !formData.first_name.trim() || 
      !formData.last_name.trim() || 
      !formData.password.trim() ||
      !formData.section ||
      !formData.school_year ||
      !formData.birthday
    ) {
      setError("Please fill out all required fields.");
      return;
    }

    if (formData.password !== formData.re_password) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setIsLoading(true);

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
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert(
        "Registration Successful",
        response.data.message || "Please check your email to activate your account before logging in.",
        [{ text: "Go to Sign In", onPress: () => router.replace("/login") }]
      );
    } catch (err: any) {
      console.log("REGISTER ERROR:", err.response?.data);
      const errorMsg = err.response?.data?.error || "Registration failed.";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#2e1065", "#3b0764", "#1e1b4b"]} style={styles.rootContainer}>
      <ImageBackground
        source={require("../assets/images/gwapo.jpg")}
        style={styles.backgroundImage}
        resizeMode="cover"
        imageStyle={{ opacity: 0.20 }} 
      >
        <SafeAreaView style={styles.safeAreaContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              
              <View style={styles.header}>
                <Text style={styles.title}>Create Your Account</Text>
                <Text style={styles.subtitle}>
                  Join the student exam portal by completing the form below.
                </Text>
              </View>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Text style={styles.sectionDivider}>Personal Information</Text>
              
              <View style={styles.formRow}>
                <Input
                  label="First Name"
                  placeholder="First name"
                  value={formData.first_name}
                  onChangeText={(text) => updateField("first_name", text)}
                  containerStyle={{ flex: 1, marginRight: 8 }}
                  editable={!isLoading}
                />
                <Input
                  label="Last Name"
                  placeholder="Last name"
                  value={formData.last_name}
                  onChangeText={(text) => updateField("last_name", text)}
                  containerStyle={{ flex: 1 }}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.formRow}>
                <Input
                  label="Middle Name"
                  placeholder="Middle name"
                  value={formData.middle_name}
                  onChangeText={(text) => updateField("middle_name", text)}
                  containerStyle={{ flex: 1, marginRight: 8 }}
                  editable={!isLoading}
                />
                
                {/* Birthday field uses calendar icon */}
                <SelectInput
                  label="Birthday"
                  placeholder="Select Date"
                  value={formData.birthday}
                  onPress={() => setActiveModal("birthday")}
                  iconName="calendar-outline"
                  containerStyle={{ flex: 1 }}
                />
              </View>

              <View style={styles.formRow}>
                <Input
                  label="Age"
                  placeholder="Auto"
                  value={formData.age ? `${formData.age} yrs` : ""}
                  editable={false}
                  containerStyle={{ flex: 1, marginRight: 8 }}
                />
                
                {/* Section field uses drop-down chevron */}
                <SelectInput
                  label="Section"
                  placeholder="Select Section"
                  value={formData.section}
                  onPress={() => setActiveModal("section")}
                  iconName="chevron-down"
                  containerStyle={{ flex: 1 }}
                />
              </View>

              {/* School Year field uses drop-down chevron */}
              <SelectInput
                label="School Year"
                placeholder="Select School Year"
                value={formData.school_year}
                onPress={() => setActiveModal("school_year")}
                iconName="chevron-down"
              />

              <Input
                label="Home Address"
                placeholder="Complete home address"
                value={formData.address}
                onChangeText={(text) => updateField("address", text)}
                editable={!isLoading}
              />

              <Text style={styles.sectionDivider}>Account Credentials</Text>

              <Input
                label="Username"
                placeholder="Choose a unique username"
                autoCapitalize="none"
                value={formData.username}
                onChangeText={(text) => updateField("username", text)}
                editable={!isLoading}
              />

              <Input
                label="Email Address"
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => updateField("email", text)}
                editable={!isLoading}
              />

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showPassword}
                    style={styles.passwordInput}
                    value={formData.password}
                    onChangeText={(text) => updateField("password", text)}
                    editable={!isLoading}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={22} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry={!showRePassword}
                    style={styles.passwordInput}
                    value={formData.re_password}
                    onChangeText={(text) => updateField("re_password", text)}
                    editable={!isLoading}
                  />
                  <TouchableOpacity onPress={() => setShowRePassword(!showRePassword)} style={styles.eyeIcon}>
                    <Ionicons name={showRePassword ? "eye-off" : "eye"} size={22} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.uploadBox}>
                <Text style={styles.uploadLabel}>Profile Photo Attachment</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={pickImage} disabled={isLoading}>
                  <Ionicons name="cloud-upload-outline" size={20} color="#6b21a8" style={{ marginRight: 6 }} />
                  <Text style={styles.uploadText}>Select Image File</Text>
                </TouchableOpacity>
                {profilePicture && (
                  <Image source={{ uri: profilePicture.uri }} style={styles.previewImage} />
                )}
              </View>

              <TouchableOpacity activeOpacity={0.9} onPress={handleRegister} disabled={isLoading}>
                <LinearGradient
                  colors={["#7e22ce", "#9333ea"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitButton}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>Register Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace("/login")} disabled={isLoading}>
                  <Text style={styles.linkText}>Sign In</Text>
                </TouchableOpacity>
              </View>

            </View>
          </ScrollView>
        </SafeAreaView>
      </ImageBackground>

      {/* 🔮 MULTI-SELECT OVERLAY SHEET MODAL */}
      <Modal
        visible={activeModal !== null}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setActiveModal(null)}>
          
          {/* RENDER FOR SECTIONS & SCHOOL YEARS */}
          {activeModal !== "birthday" && activeModal !== null && (
            <View style={styles.modalContentCard}>
              <View style={styles.modalIndicatorBar} />
              <Text style={styles.modalTitleText}>
                {activeModal === "section" ? "Select Academic Section" : "Select Academic School Year"}
              </Text>
              
              <FlatList
                data={activeModal === "section" ? sections : schoolYears}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalSelectItem,
                      ((activeModal === "section" && formData.section === item) ||
                       (activeModal === "school_year" && formData.school_year === item)) && styles.modalSelectItemActive
                    ]}
                    onPress={() => {
                      if (activeModal === "section") updateField("section", item);
                      if (activeModal === "school_year") updateField("school_year", item);
                      setActiveModal(null);
                    }}
                  >
                    <Text style={[
                      styles.modalSelectItemText,
                      ((activeModal === "section" && formData.section === item) ||
                       (activeModal === "school_year" && formData.school_year === item)) && styles.modalSelectItemTextActive
                    ]}>
                      {item}
                    </Text>
                    {((activeModal === "section" && formData.section === item) ||
                      (activeModal === "school_year" && formData.school_year === item)) && (
                      <Ionicons name="checkmark-circle" size={20} color="#7e22ce" />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* 📅 DISTINCTION RENDER FOR THE BIRTHDAY DATE PICKER WHEELS */}
          {activeModal === "birthday" && (
            <View style={styles.modalContentCard}>
              <View style={styles.modalIndicatorBar} />
              <Text style={styles.modalTitleText}>Select Date of Birth</Text>
              
              <View style={styles.pickerColumnsRow}>
                
                {/* MONTH SELECT COLUMN */}
                <View style={styles.pickerColumnGroup}>
                  <Text style={styles.pickerColumnHeader}>Month</Text>
                  <FlatList
                    data={months}
                    keyExtractor={(item) => item.value}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={[styles.dateScrollItem, tempMonth === item.value && styles.dateScrollItemActive]}
                        onPress={() => setTempMonth(item.value)}
                      >
                        <Text style={[styles.dateScrollItemText, tempMonth === item.value && styles.dateScrollItemTextActive]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>

                {/* DAY SELECT COLUMN */}
                <View style={styles.pickerColumnGroup}>
                  <Text style={styles.pickerColumnHeader}>Day</Text>
                  <FlatList
                    data={days}
                    keyExtractor={(item) => item}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={[styles.dateScrollItem, tempDay === item && styles.dateScrollItemActive]}
                        onPress={() => setTempDay(item)}
                      >
                        <Text style={[styles.dateScrollItemText, tempDay === item && styles.dateScrollItemTextActive]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>

                {/* YEAR SELECT COLUMN */}
                <View style={styles.pickerColumnGroup}>
                  <Text style={styles.pickerColumnHeader}>Year</Text>
                  <FlatList
                    data={birthYears}
                    keyExtractor={(item) => item}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <TouchableOpacity 
                        style={[styles.dateScrollItem, tempYear === item && styles.dateScrollItemActive]}
                        onPress={() => setTempYear(item)}
                      >
                        <Text style={[styles.dateScrollItemText, tempYear === item && styles.dateScrollItemTextActive]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>

              </View>

              <TouchableOpacity style={styles.modalConfirmBtn} onPress={confirmBirthdaySelection}>
                <Text style={styles.modalConfirmBtnText}>Confirm Selection</Text>
              </TouchableOpacity>
            </View>
          )}

        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  rootContainer: { flex: 1 },
  backgroundImage: { width: "100%", height: "100%", flex: 1 },
  safeAreaContainer: { flex: 1 },
  scrollContainer: { paddingHorizontal: 16, paddingVertical: 32 },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.96)",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(126, 34, 206, 0.15)",
  },
  header: { marginBottom: 24, alignItems: "center" },
  title: { fontSize: 28, fontWeight: "800", color: "#0f172a", textAlign: "center" },
  subtitle: { marginTop: 8, fontSize: 14, lineHeight: 20, textAlign: "center", color: "#64748b" },
  sectionDivider: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#6b21a8",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 6,
    marginBottom: 16,
    marginTop: 12,
  },
  formRow: { flexDirection: "row", justifyContent: "space-between" },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 6, color: "#334155" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  disabledInput: { backgroundColor: "#f1f5f9", color: "#64748b" },
  selectTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    height: 48,
  },
  selectTriggerText: { fontSize: 14, color: "#0f172a" },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  passwordInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#0f172a" },
  eyeIcon: { paddingHorizontal: 12, justifyContent: "center" },
  uploadBox: {
    backgroundColor: "rgba(248, 250, 252, 0.8)",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#cbd5e1",
    borderRadius: 16,
    padding: 16,
    marginVertical: 14,
  },
  uploadLabel: { fontSize: 13, fontWeight: "700", color: "#334155", textAlign: "center" },
  uploadButton: {
    flexDirection: "row",
    backgroundColor: "#f3e8ff",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  uploadText: { color: "#6b21a8", fontWeight: "700", fontSize: 13 },
  previewImage: { width: 80, height: 80, borderRadius: 40, marginTop: 14, alignSelf: "center" },
  submitButton: { paddingVertical: 14, borderRadius: 24, alignItems: "center", marginTop: 10, minHeight: 50, justifyContent: "center" },
  submitButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "800" },
  errorBox: { backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", borderRadius: 12, padding: 12, marginBottom: 18 },
  errorText: { color: "#b91c1c", textAlign: "center", fontWeight: "600", fontSize: 13 },
  footer: { marginTop: 24, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  footerText: { color: "#64748b", fontSize: 14 },
  linkText: { color: "#7e22ce", fontWeight: "700", fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(15, 23, 42, 0.6)", justifyContent: "flex-end" },
  modalContentCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 40,
    maxHeight: "60%",
  },
  modalIndicatorBar: { width: 48, height: 5, backgroundColor: "#cbd5e1", borderRadius: 10, alignSelf: "center", marginBottom: 20 },
  modalTitleText: { fontSize: 18, fontWeight: "800", color: "#0f172a", marginBottom: 20, textAlign: "center" },
  modalSelectItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 16, paddingHorizontal: 14, borderRadius: 14, marginBottom: 6 },
  modalSelectItemActive: { backgroundColor: "#f3e8ff" },
  modalSelectItemText: { fontSize: 15, color: "#334155", fontWeight: "500" },
  modalSelectItemTextActive: { color: "#7e22ce", fontWeight: "700" },

  pickerColumnsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: 180,
    marginBottom: 20,
  },
  pickerColumnGroup: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    paddingTop: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  pickerColumnHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6b21a8",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  dateScrollItem: {
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 6,
    marginBottom: 2,
  },
  dateScrollItemActive: {
    backgroundColor: "#e9d5ff",
  },
  dateScrollItemText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },
  dateScrollItemTextActive: {
    color: "#6b21a8",
    fontWeight: "700",
  },
  modalConfirmBtn: {
    backgroundColor: "#7e22ce",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  modalConfirmBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
});
