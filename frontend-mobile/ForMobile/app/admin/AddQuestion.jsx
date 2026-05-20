import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Alert, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function AddQuestion() {
  const { examId } = useLocalSearchParams(); // ✅ Expo Router instead of useParams
  const router = useRouter();
    // HEY!!! if you see "ERROR  [AxiosError: Network Error]" you did not turn on your django
  const [questions, setQuestions] = useState([]);
  const [examTitle, setExamTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    question_type: 'MCQ',
    required_keywords: '',
    options: [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ],
  });

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState(null);

  const getHeaders = async () => {
    const token = await AsyncStorage.getItem('auth');
    return { Authorization: `Token ${token}` };
  };

  const fetchExamData = async () => {
    try {
      const headers = await getHeaders();
      const res = await axios.get(`http://192.168.1.173:8000/api/exams/${examId}/`, { headers });
      setQuestions(res.data.questions);
      setExamTitle(res.data.title);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchExamData(); }, [examId]);

  const handleSubmit = async () => {
    if (newQuestion.question_type === 'MCQ' && !newQuestion.options.some(opt => opt.is_correct)) {
      Alert.alert('Error', 'Please mark at least one correct answer!');
      return;
    }

    setLoading(true);
    try {
      const headers = await getHeaders();
      if (editingId) {
        await axios.put(`http://192.168.1.173:8000/api/questions/${editingId}/`,
          { ...newQuestion, exam: examId }, { headers });
      } else {
        await axios.post(`http://192.168.1.173:8000/api/questions/`,
          { ...newQuestion, exam: examId }, { headers });
      }
      handleCancelEdit();
      fetchExamData();
    } catch (err) {
      Alert.alert('Error', 'Error saving question.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (q) => {
    setEditingId(q.id);
    setNewQuestion({
      text: q.text,
      question_type: q.question_type || 'MCQ',
      required_keywords: q.required_keywords || '',
      options: q.options && q.options.length > 0 ? q.options : [
        { text: '', is_correct: false }, { text: '', is_correct: false },
        { text: '', is_correct: false }, { text: '', is_correct: false },
      ],
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewQuestion({
      text: '', question_type: 'MCQ', required_keywords: '',
      options: [
        { text: '', is_correct: false }, { text: '', is_correct: false },
        { text: '', is_correct: false }, { text: '', is_correct: false },
      ],
    });
  };

  const confirmDelete = (qId) => {
    setDeleteQuestionId(qId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      const headers = await getHeaders();
      await axios.delete(`http://192.168.1.173:8000/api/questions/${deleteQuestionId}/`, { headers });
      setShowDeleteModal(false);
      setDeleteQuestionId(null);
      fetchExamData();
    } catch (err) {
      Alert.alert('Error', 'Failed to delete question.');
    }
  };

  const updateOption = (index, field, value) => {
    const updated = [...newQuestion.options];
    updated[index] = { ...updated[index], [field]: value };
    setNewQuestion({ ...newQuestion, options: updated });
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

      {/* Header */}
      <Text style={styles.title}>Manage Exam Questions</Text>
      <Text style={styles.subtitle}>
        Exam: <Text style={styles.examTitle}>{examTitle}</Text>
      </Text>

      {/* FORM CARD */}
      <View style={[styles.formCard, editingId ? styles.formCardEditing : null]}>
        <Text style={styles.formTitle}>{editingId ? '📝 Edit Question' : '➕ Add Question'}</Text>

        {/* Question Text */}
        <TextInput
          style={styles.textarea}
          placeholder="Enter question text..."
          placeholderTextColor="#94a3b8"
          value={newQuestion.text}
          onChangeText={v => setNewQuestion({ ...newQuestion, text: v })}
          multiline
          numberOfLines={3}
        />

        {/* Question Type Toggle */}
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, newQuestion.question_type === 'MCQ' && styles.typeBtnActive]}
            onPress={() => setNewQuestion({ ...newQuestion, question_type: 'MCQ' })}>
            <Text style={[styles.typeBtnText, newQuestion.question_type === 'MCQ' && styles.typeBtnTextActive]}>
              Multiple Choice
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, newQuestion.question_type === 'ESSAY' && styles.typeBtnActive]}
            onPress={() => setNewQuestion({ ...newQuestion, question_type: 'ESSAY' })}>
            <Text style={[styles.typeBtnText, newQuestion.question_type === 'ESSAY' && styles.typeBtnTextActive]}>
              Essay
            </Text>
          </TouchableOpacity>
        </View>

        {/* MCQ Options */}
        {newQuestion.question_type === 'MCQ' ? (
          <View style={styles.optionsGrid}>
            {newQuestion.options.map((opt, i) => (
              <View key={i} style={[styles.optionRow, opt.is_correct && styles.optionRowCorrect]}>
                <TouchableOpacity
                  style={[styles.checkbox, opt.is_correct && styles.checkboxChecked]}
                  onPress={() => updateOption(i, 'is_correct', !opt.is_correct)}>
                  {opt.is_correct && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
                <TextInput
                  style={styles.optionInput}
                  placeholder={`Option ${i + 1}`}
                  placeholderTextColor="#94a3b8"
                  value={opt.text}
                  onChangeText={v => updateOption(i, 'text', v)}
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
            onChangeText={v => setNewQuestion({ ...newQuestion, required_keywords: v })}
          />
        )}

        {/* Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitBtnText}>{editingId ? 'UPDATE QUESTION' : 'SAVE QUESTION'}</Text>
            }
          </TouchableOpacity>
          {editingId && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelEdit}>
              <Text style={styles.cancelBtnText}>CANCEL</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* QUESTION LIST */}
      <Text style={styles.bankLabel}>Questions in Bank ({questions.length})</Text>

      {questions.map((q, i) => (
        <View key={q.id} style={styles.questionCard}>
          <View style={styles.questionInfo}>
            <Text style={styles.questionType}>{q.question_type}</Text>
            <Text style={styles.questionText}>{i + 1}. {q.text}</Text>
          </View>
          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.editBtn} onPress={() => handleEditClick(q)}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => confirmDelete(q.id)}>
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* DELETE MODAL */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Delete Question?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete this question? This action cannot be undone.
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDelete} onPress={handleDelete}>
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 16, paddingBottom: 40 },

  title: { fontSize: 20, fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#64748b', fontWeight: '500', marginBottom: 24 },
  examTitle: { color: '#4f46e5', textDecorationLine: 'underline' },

  // Form
  formCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    borderWidth: 2, borderColor: '#e2e8f0', marginBottom: 28,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  formCardEditing: { borderColor: '#4f46e5', backgroundColor: '#f5f3ff' },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },

  textarea: {
    borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10,
    padding: 12, fontSize: 14, color: '#1e293b', minHeight: 80,
    textAlignVertical: 'top', marginBottom: 12, backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10,
    padding: 12, fontSize: 14, color: '#1e293b',
    backgroundColor: '#fff', marginBottom: 12,
  },

  // Type toggle
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  typeBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    borderWidth: 2, borderColor: '#e2e8f0',
    alignItems: 'center', backgroundColor: '#fff',
  },
  typeBtnActive: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
  typeBtnText: { fontWeight: '700', color: '#64748b', fontSize: 13 },
  typeBtnTextActive: { color: '#4f46e5' },

  // Options
  optionsGrid: { gap: 10, marginBottom: 12 },
  optionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', padding: 12, borderRadius: 10,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  optionRowCorrect: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
  checkbox: {
    width: 22, height: 22, borderRadius: 4,
    borderWidth: 2, borderColor: '#cbd5e1',
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '900' },
  optionInput: { flex: 1, fontSize: 13, fontWeight: '700', color: '#1e293b' },

  // Buttons
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  submitBtn: {
    flex: 1, backgroundColor: '#4f46e5', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  cancelBtn: {
    paddingHorizontal: 16, paddingVertical: 14, borderRadius: 10,
    backgroundColor: '#e2e8f0', alignItems: 'center',
  },
  cancelBtnText: { color: '#64748b', fontWeight: '700', fontSize: 13 },

  // Question list
  bankLabel: {
    fontSize: 10, fontWeight: '900', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12,
  },
  questionCard: {
    backgroundColor: '#fff', padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: '#f1f5f9',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6,
    elevation: 1, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
  },
  questionInfo: { flex: 1 },
  questionType: { fontSize: 10, fontWeight: '900', color: '#818cf8', textTransform: 'uppercase', marginBottom: 4 },
  questionText: { fontWeight: '700', color: '#1e293b', fontSize: 14 },
  actionBtns: { flexDirection: 'row', gap: 8 },
  editBtn: { backgroundColor: '#eef2ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  editBtnText: { color: '#4f46e5', fontWeight: '900', fontSize: 11 },
  deleteBtn: { backgroundColor: '#fef2f2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  deleteBtnText: { color: '#ef4444', fontWeight: '900', fontSize: 11 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    width: '100%', maxWidth: 360,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#1e293b', marginBottom: 10 },
  modalMessage: { fontSize: 14, color: '#64748b', lineHeight: 20, marginBottom: 20 },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalCancel: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#e2e8f0' },
  modalCancelText: { color: '#475569', fontWeight: '700' },
  modalDelete: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#ef4444' },
  modalDeleteText: { color: '#fff', fontWeight: '700' },
});