import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../services/api";

export default function CreateExam() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [passMark, setPassMark] = useState(50);
  const router = useRouter();

  const handleIncrement = () => {
    if (passMark < 100) setPassMark((prev) => prev + 5);
  };

  const handleDecrement = () => {
    if (passMark > 0) setPassMark((prev) => prev - 5);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Missing Fields", "Please complete all fields.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("auth");
      const res = await api.post(
        "exams/",
        {
          title,
          description,
          pass_mark: passMark,
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      router.push({
        pathname: "/(admin)/add-question/[examId]",
        params: { examId: res.data.id },
      });
    } catch (err) {
      Alert.alert("Error", "Error creating exam. Check backend connection.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>Setup New Exam</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Exam Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., CCNA: Subnetting Basics"
              placeholderTextColor="#94a3b8"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Instructions</Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              placeholder="Describe what the student needs to know..."
              placeholderTextColor="#94a3b8"
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.thresholdContainer}>
            <View style={styles.thresholdHeader}>
              <Text style={styles.thresholdLabel}>Passing Threshold</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{passMark}%</Text>
              </View>
            </View>

            <View style={styles.stepperRow}>
              <TouchableOpacity style={styles.stepButton} onPress={handleDecrement}>
                <Text style={styles.stepButtonText}>-</Text>
              </TouchableOpacity>
              
              <View style={styles.trackContainer}>
                <View style={[styles.trackFill, { width: `${passMark}%` }]} />
              </View>

              <TouchableOpacity style={styles.stepButton} onPress={handleIncrement}>
                <Text style={styles.stepButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.hintText}>
              Students must reach this percentage to be marked as "PASSED."
            </Text>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>CREATE & CONTINUE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 24 },
  card: { backgroundColor: "#ffffff", padding: 24, borderRadius: 32, borderWidth: 1, borderColor: "#e2e8f0", elevation: 2, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12 },
  title: { fontSize: 22, fontWeight: "900", color: "#0f172a", textTransform: "uppercase", letterSpacing: -0.5, marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 11, fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.5 },
  input: { backgroundColor: "#ffffff", padding: 14, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 16, fontSize: 15, color: "#1e293b", fontWeight: "500" },
  textArea: { backgroundColor: "#ffffff", padding: 14, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 16, fontSize: 15, color: "#1e293b", height: 120, textAlignVertical: "top", fontWeight: "500" },
  thresholdContainer: { backgroundColor: "#f8fafc", padding: 18, borderRadius: 20, borderWidth: 1, borderColor: "#e2e8f0", marginBottom: 28 },
  thresholdHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  thresholdLabel: { fontSize: 12, fontWeight: "800", color: "#475569", textTransform: "uppercase" },
  badge: { backgroundColor: "#4f46e5", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99 },
  badgeText: { color: "#ffffff", fontWeight: "900", fontSize: 13 },
  stepperRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  stepButton: { width: 40, height: 40, backgroundColor: "#ffffff", borderRadius: 12, borderWidth: 1, borderColor: "#cbd5e1", justifyContent: "center", alignItems: "center", elevation: 1 },
  stepButtonText: { fontSize: 20, fontWeight: "600", color: "#475569", marginTop: -2 },
  trackContainer: { flex: 1, height: 8, backgroundColor: "#e2e8f0", borderRadius: 99, overflow: "hidden" },
  trackFill: { height: "100%", backgroundColor: "#4f46e5", borderRadius: 99 },
  hintText: { fontSize: 10, color: "#94a3b8", fontStyle: "italic", marginTop: 12 },
  submitButton: { backgroundColor: "#4f46e5", paddingVertical: 16, borderRadius: 16, alignItems: "center", shadowColor: "#4f46e5", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  submitButtonText: { color: "#ffffff", fontWeight: "900", fontSize: 15, letterSpacing: 1 },
});