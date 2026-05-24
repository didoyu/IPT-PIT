import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  ActivityIndicator, 
  Alert,
  SafeAreaView 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckSquare, Square, Award, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import api from '../../../services/api';

interface Option {
  id: number;
  text: string;
}

interface Question {
  id: number;
  text: string;
  question_type: 'MCQ' | 'ESSAY';
  options: Option[];
}

interface ExamDetails {
  title: string;
  description: string;
  questions: Question[];
}

export default function TakeExam() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [exam, setExam] = useState<ExamDetails | null>(null);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyTaken, setAlreadyTaken] = useState(false);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState({
    show: false,
    passed: false,
    score: 0,
    message: "",
    detail: ""
  });

  useEffect(() => {
    const loadExamData = async () => {
      try {
        const examRes = await api.get(`exams/${id}/`);
        setExam(examRes.data);

        const checkRes = await api.get(`exams/${id}/taken/`);
        if (checkRes.data.taken) {
          setAlreadyTaken(true);
          setModal({
            show: true,
            passed: false,
            score: 0,
            message: "ALREADY TAKEN",
            detail: "You have already completed this exam module. Attempt records are closed."
          });
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Sync Error", "Could not retrieve question files.");
      } finally {
        setLoading(false);
      }
    };
    loadExamData();
  }, [id]);

  const handleMCQToggle = (qId: number, optId: number) => {
    const currentSelections = answers[qId] || [];
    const newSelections = currentSelections.includes(optId)
      ? currentSelections.filter((item: number) => item !== optId)
      : [...currentSelections, optId];

    setAnswers({ ...answers, [qId]: newSelections });
  };

  const handleEssayChange = (qId: number, text: string) => {
    setAnswers({ ...answers, [qId]: text });
  };

  const handleSubmit = async () => {
    if (alreadyTaken) return;

    if (!exam?.questions || Object.keys(answers).length < exam.questions.length) {
      Alert.alert("Incomplete Exam", "Please answer all questions before submitting your papers.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('submit-exam/', {
        exam_id: id,
        answers: answers
      });

      setModal({
        show: true,
        passed: res.data.is_passed,
        score: res.data.score,
        message: res.data.is_passed ? "PASSED" : "FAILED",
        detail: res.data.is_passed
          ? "Excellent work! You have successfully cleared this module criteria."
          : "You did not achieve the required threshold this time."
      });
      setAlreadyTaken(true);
    } catch (err: any) {
      const msg = err.response?.data?.error || "Submission failure. Check connections.";
      Alert.alert("Network Error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !exam) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.examTitle}>{exam.title}</Text>
          <Text style={styles.examDescription}>{exam.description}</Text>
        </View>

        {exam.questions.map((q, index) => (
          <View key={q.id} style={styles.questionCard}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionIndex}>Item #{index + 1}</Text>
              <View style={[styles.typeBadge, q.question_type === 'ESSAY' && styles.essayBadge]}>
                <Text style={styles.typeBadgeText}>{q.question_type}</Text>
              </View>
            </View>

            <Text style={styles.questionText}>{q.text}</Text>

            {q.question_type === 'MCQ' ? (
              <View style={styles.optionsWrapper}>
                {q.options.map((opt) => {
                  const isChecked = (answers[q.id] || []).includes(opt.id);
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[styles.optionRow, isChecked && styles.optionRowChecked]}
                      activeOpacity={0.7}
                      onPress={() => handleMCQToggle(q.id, opt.id)}
                    >
                      {isChecked ? (
                        <CheckSquare size={18} color="#4f46e5" />
                      ) : (
                        <Square size={18} color="#94a3b8" />
                      )}
                      <Text style={[styles.optionText, isChecked && styles.optionTextChecked]}>
                        {opt.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <TextInput
                style={styles.essayInput}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                placeholder="Type your detailed narrative response here..."
                placeholderTextColor="#94a3b8"
                value={answers[q.id] || ''}
                onChangeText={(text) => handleEssayChange(q.id, text)}
              />
            )}
          </View>
        ))}

        <TouchableOpacity 
          style={[styles.submitButton, (isSubmitting || alreadyTaken) && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={isSubmitting || alreadyTaken}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {alreadyTaken ? "EXAM COMPLETED" : "SUBMIT ASSESSMENT"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* PERFORMANCE SUMMARY MODAL */}
      <Modal visible={modal.show} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconBox}>
              {modal.message === "PASSED" ? (
                <CheckCircle2 size={48} color="#10b981" />
              ) : (
                <AlertCircle size={48} color="#ef4444" />
              )}
            </View>
            
            <Text style={styles.modalTitle}>{modal.message}</Text>
            
            {modal.score > 0 && (
              <View style={styles.scoreRow}>
                <Award size={16} color="#4f46e5" />
                <Text style={styles.scoreText}>Calculated Score: {modal.score}%</Text>
              </View>
            )}

            <Text style={styles.modalDetail}>{modal.detail}</Text>

            <TouchableOpacity 
              style={styles.modalCloseBtn}
              onPress={() => {
                setModal({ ...modal, show: false });
                router.replace('/(student)/studentdashboard');
              }}
            >
              <Text style={styles.modalCloseBtnText}>RETURN TO DASHBOARD</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  header: { marginBottom: 24, marginTop: 16 },
  examTitle: { fontSize: 24, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' },
  examDescription: { fontSize: 14, color: '#64748b', marginTop: 6, lineHeight: 20, fontWeight: '500' },
  questionCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  questionIndex: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
  typeBadge: { backgroundColor: '#e0e7ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  essayBadge: { backgroundColor: '#fef3c7' },
  typeBadgeText: { fontSize: 10, fontWeight: '900', color: '#4f46e5' },
  questionText: { fontSize: 15, fontWeight: '700', color: '#1e293b', lineHeight: 22, marginBottom: 16 },
  optionsWrapper: { gap: 10 },
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', gap: 10, backgroundColor: '#f8fafc' },
  optionRowChecked: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
  optionText: { fontSize: 14, fontWeight: '600', color: '#475569', flex: 1 },
  optionTextChecked: { color: '#4f46e5', fontWeight: '700' },
  essayInput: { backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', padding: 14, fontSize: 14, color: '#1e293b', minHeight: 100 },
  submitButton: { backgroundColor: '#4f46e5', paddingVertical: 16, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: 12, elevation: 2 },
  disabledButton: { backgroundColor: '#94a3b8' },
  submitButtonText: { color: '#ffffff', fontWeight: '800', fontSize: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContainer: { backgroundColor: '#ffffff', borderRadius: 32, padding: 28, width: '100%', maxWidth: 340, alignItems: 'center' },
  modalIconBox: { marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#0f172a', letterSpacing: 0.5 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, backgroundColor: '#f5f3ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99 },
  scoreText: { color: '#4f46e5', fontSize: 12, fontWeight: '800' },
  modalDetail: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20, marginTop: 12, marginBottom: 24, fontWeight: '500' },
  modalCloseBtn: { backgroundColor: '#0f172a', width: '100%', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  modalCloseBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 }
});