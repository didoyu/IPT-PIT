import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../../services/api";

interface Option {
  text: string;
  is_correct: boolean;
}

interface Question {
  id: number;
  text: string;
  question_type: string;
  required_keywords: string;
  options: Option[];
}

export default function AddQuestion() {
  const { examId } = useLocalSearchParams<{ examId: string }>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [examTitle, setExamTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [newQuestion, setNewQuestion] = useState({
    text: "",
    question_type: "MCQ",
    required_keywords: "",
    options: [
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
      { text: "", is_correct: false },
    ],
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState<number | null>(null);

  const fetchExamData = async () => {
    try {
      const token = await AsyncStorage.getItem("auth");
      const res = await api.get(`exams/${examId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setQuestions(res.data.questions || []);
      setExamTitle(res.data.title || "");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch exam questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (examId) fetchExamData();
  }, [examId]);

  const handleSubmit = async () => {
    if (!newQuestion.text.trim()) {
      Alert.alert("Required", "Please enter the question text.");
      return;
    }

    if (
      newQuestion.question_type === "MCQ" &&
      !newQuestion.options.some((opt) => opt.is_correct)
    ) {
      Alert.alert("Validation", "Please mark at least one correct answer!");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("auth");
      const payload = { ...newQuestion, exam: examId };
      const headers = { Authorization: `Token ${token}` };

      if (editingId) {
        await api.put(`questions/${editingId}/`, payload, { headers });
      } else {
        await api.post(`questions/`, payload, { headers });
      }
      handleCancelEdit();
      fetchExamData();
    } catch (err) {
      Alert.alert("Error", "Error saving question.");
    }
  };

  const handleEditClick = (q: Question) => {
    setEditingId(q.id);
    setNewQuestion({
      text: q.text,
      question_type: q.question_type || "MCQ",
      required_keywords: q.required_keywords || "",
      options:
        q.options && q.options.length > 0
          ? q.options
          : [
              { text: "", is_correct: false },
              { text: "", is_correct: false },
              { text: "", is_correct: false },
              { text: "", is_correct: false },
            ],
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewQuestion({
      text: "",
      question_type: "MCQ",
      required_keywords: "",
      options: [
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
        { text: "", is_correct: false },
      ],
    });
  };

  const confirmDelete = (qId: number) => {
    setDeleteQuestionId(qId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const token = await AsyncStorage.getItem("auth");
      await api.delete(`questions/${deleteQuestionId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setShowDeleteModal(false);
      setDeleteQuestionId(null);
      fetchExamData();
    } catch (err) {
      Alert.alert("Error", "Failed to delete question.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Manage Questions</Text>
        <Text style={styles.subtitle}>
          Exam: <Text style={styles.examHighlight}>{examTitle}</Text>
        </Text>

        {/* FORM CONTAINER */}
        <View
          style={[
            styles.formCard,
            editingId ? styles.formCardEditing : styles.formCardNormal,
          ]}
        >
          <Text style={styles.formHeader}>
            {editingId ? "📝 Edit Question" : "➕ Add Question"}
          </Text>

          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder="Enter question text..."
            placeholderTextColor="#94a3b8"
            value={newQuestion.text}
            onChangeText={(val) => setNewQuestion({ ...newQuestion, text: val })}
          />

          {/* TYPE TOGGLE ROUTE ROWS */}
          <View style={styles.typeToggleRow}>
            <TouchableOpacity
              style={[
                styles.typeTab,
                newQuestion.question_type === "MCQ" && styles.activeTypeTab,
              ]}
              onPress={() => setNewQuestion({ ...newQuestion, question_type: "MCQ" })}
            >
              <Text
                style={[
                  styles.typeTabText,
                  newQuestion.question_type === "MCQ" && styles.activeTypeTabText,
                ]}
              >
                Multiple Choice
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeTab,
                newQuestion.question_type === "ESSAY" && styles.activeTypeTab,
              ]}
              onPress={() => setNewQuestion({ ...newQuestion, question_type: "ESSAY" })}
            >
              <Text
                style={[
                  styles.typeTabText,
                  newQuestion.question_type === "ESSAY" && styles.activeTypeTabText,
                ]}
              >
                Essay
              </Text>
            </TouchableOpacity>
          </View>

          {/* DYNAMIC RENDERING FIELD OPTIONS */}
          {newQuestion.question_type === "MCQ" ? (
            <View style={styles.optionsGrid}>
              {newQuestion.options.map((opt, i) => (
                <View key={i} style={styles.optionRow}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      opt.is_correct && styles.checkboxChecked,
                    ]}
                    onPress={() => {
                      const updated = [...newQuestion.options];
                      updated[i].is_correct = !updated[i].is_correct;
                      setNewQuestion({ ...newQuestion, options: updated });
                    }}
                  >
                    {opt.is_correct && <View style={styles.checkboxInner} />}
                  </TouchableOpacity>
                  <TextInput
                    style={styles.optionInput}
                    placeholder={`Option ${i + 1}`}
                    placeholderTextColor="#94a3b8"
                    value={opt.text}
                    onChangeText={(val) => {
                      const updated = [...newQuestion.options];
                      updated[i].text = val;
                      setNewQuestion({ ...newQuestion, options: updated });
                    }}
                  />
                </View>
              ))}
            </View>
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Keywords for grading (e.g. Cisco, OSPF, VLAN)"
              placeholderTextColor="#94a3b8"
              value={newQuestion.required_keywords}
              onChangeText={(val) =>
                setNewQuestion({ ...newQuestion, required_keywords: val })
              }
            />
          )}

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                {editingId ? "UPDATE QUESTION" : "SAVE QUESTION"}
              </Text>
            </TouchableOpacity>
            {editingId && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEdit}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* QUESTIONS LIST BANK */}
        <Text style={styles.sectionTitle}>
          Questions in Bank ({questions.length})
        </Text>
        {questions.map((q, i) => (
          <View key={q.id || i} style={styles.questionCard}>
            <View style={styles.questionDetails}>
              <Text style={styles.badgeText}>{q.question_type}</Text>
              <Text style={styles.questionText}>
                {i + 1}. {q.text}
              </Text>
            </View>
            <View style={styles.rowActions}>
              <TouchableOpacity
                style={styles.inlineEditBtn}
                onPress={() => handleEditClick(q)}
              >
                <Text style={styles.inlineEditBtnText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.inlineDeleteBtn}
                onPress={() => confirmDelete(q.id)}
              >
                <Text style={styles.inlineDeleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* CONFIRM DELETE MODAL OVERLAY */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Question?</Text>
            <Text style={styles.modalText}>
              Are you sure you want to delete this question? This action cannot be
              undone.
            </Text>
            <div style={{ flexDirection: "row", gap: 12, justifyContent: "flex-end", width: "100%" }}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirm}
                onPress={handleDelete}
              >
                <Text style={styles.modalConfirmText}>Delete</Text>
              </TouchableOpacity>
            </div>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 24 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "900", color: "#0f172a", textTransform: "uppercase" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4, marginBottom: 24, fontWeight: "500" },
  examHighlight: { color: "#4f46e5", textDecorationLine: "underline", fontWeight: "700" },
  formCard: { padding: 20, borderRadius: 24, borderWidth: 2, marginBottom: 24 },
  formCardNormal: { backgroundColor: "#ffffff", borderColor: "#e2e8f0" },
  formCardEditing: { backgroundColor: "#f5f3ff", borderColor: "#4f46e5" },
  formHeader: { fontSize: 16, fontWeight: "800", color: "#1e293b", marginBottom: 16 },
  textArea: { backgroundColor: "#ffffff", padding: 14, borderRadius: 16, borderStyle: "solid", borderWidth: 1, borderColor: "#cbd5e1", fontSize: 15, textAlignVertical: "top", color: "#1e293b", marginBottom: 14, fontWeight: "500" },
  typeToggleRow: { flexDirection: "row", backgroundColor: "#f1f5f9", padding: 4, borderRadius: 14, marginBottom: 14 },
  typeTab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  activeTypeTab: { backgroundColor: "#ffffff", elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  typeTabText: { fontSize: 13, fontWeight: "700", color: "#64748b" },
  activeTypeTabText: { color: "#4f46e5" },
  optionsGrid: { gap: 10, marginBottom: 16 },
  optionRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", padding: 12, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 16, gap: 12 },
  checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: "#cbd5e1", borderRadius: 6, justifyContent: "center", alignItems: "center" },
  checkboxChecked: { borderColor: "#4f46e5", backgroundColor: "#4f46e5" },
  checkboxInner: { width: 8, height: 8, backgroundColor: "#ffffff", borderRadius: 2 },
  optionInput: { flex: 1, fontSize: 14, fontWeight: "700", color: "#1e293b" },
  input: { backgroundColor: "#ffffff", padding: 14, borderStyle: "solid", borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 16, fontSize: 14, color: "#1e293b", marginBottom: 16 },
  actionRow: { flexDirection: "row", gap: 12 },
  submitButton: { flex: 1, backgroundColor: "#4f46e5", paddingVertical: 14, borderRadius: 16, alignItems: "center" },
  submitButtonText: { color: "#ffffff", fontWeight: "900", fontSize: 14, letterSpacing: 0.5 },
  cancelButton: { backgroundColor: "#e2e8f0", paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16, justifyContent: "center" },
  cancelButtonText: { color: "#475569", fontWeight: "700", fontSize: 13 },
  sectionTitle: { fontSize: 11, fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 14 },
  questionCard: { backgroundColor: "#ffffff", padding: 16, borderRadius: 20, borderWidth: 1, borderColor: "#f1f5f9", marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  questionDetails: { flex: 1, paddingRight: 12 },
  badgeText: { fontSize: 9, fontWeight: "900", color: "#4f46e5", textTransform: "uppercase", marginBottom: 4, letterSpacing: 0.5 },
  questionText: { fontSize: 15, fontWeight: "700", color: "#1e293b", lineHeight: 22 },
  rowActions: { flexDirection: "row", gap: 8 },
  inlineEditBtn: { backgroundColor: "#f5f3ff", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  inlineEditBtnText: { color: "#4f46e5", fontSize: 12, fontWeight: "800" },
  inlineDeleteBtn: { backgroundColor: "#fef2f2", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  inlineDeleteBtnText: { color: "#ef4444", fontSize: 12, fontWeight: "800" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 24 },
  modalContent: { backgroundColor: "#ffffff", padding: 24, borderRadius: 24, width: "100%", maxWidth: 340, alignItems: "flex-start" },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0f172a", marginBottom: 8 },
  modalText: { fontSize: 14, color: "#64748b", lineHeight: 20, marginBottom: 24 },
  modalCancel: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: "#f1f5f9" },
  modalCancelText: { color: "#475569", fontWeight: "700" },
  modalConfirm: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: "#ef4444" },
  modalConfirmText: { color: "#ffffff", fontWeight: "700" },
});