import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal, ActivityIndicator, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';
import ResultsTable from './results-table'; // ✅ adjust path if needed

export default function AdminDashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);

  const router = useRouter();

  const getHeaders = async () => {
    const token = await AsyncStorage.getItem('auth');
    return { Authorization: `Token ${token}` };
  };

  const fetchExams = async () => {
    try {
      const headers = await getHeaders();
      const res = await axios.get('http://192.168.1.42:8000/api/exams/', { headers });
      setExams(res.data);
    } catch (err) {
      console.error('Failed to fetch exams', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExams(); }, []);

  const handleDeleteClick = (exam) => {
    setExamToDelete(exam);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const headers = await getHeaders();
      await axios.delete(`http://192.168.1.42:8000/api/exams/${examToDelete.id}/`, { headers });
      setExams(exams.filter(e => e.id !== examToDelete.id));
      setShowDeleteModal(false);
      setExamToDelete(null);
    } catch (err) {
      Alert.alert('Error', 'Error deleting exam.');
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Manage exams, questions, and view student performance.</Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => router.push('/admin/create-exam')}>
          <Text style={styles.createBtnText}>+ CREATE EXAM</Text>
        </TouchableOpacity>
      </View>

      {/* EXAM MODULES */}
      <Text style={styles.sectionLabel}>Active Exam Modules</Text>

      {loading ? (
        <ActivityIndicator color="#4f46e5" style={{ marginTop: 20 }} />
      ) : exams.length === 0 ? (
        <Text style={styles.emptyText}>No exams yet. Create one!</Text>
      ) : (
        exams.map(exam => (
          <View key={exam.id} style={styles.examCard}>

            {/* DELETE BUTTON */}
            <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() => handleDeleteClick(exam)}>
              <Text style={styles.deleteIconText}>🗑️</Text>
            </TouchableOpacity>

            <Text style={styles.examTitle}>{exam.title}</Text>
            <Text style={styles.examDesc} numberOfLines={2}>{exam.description}</Text>

            <View style={styles.examFooter}>
              <Text style={styles.thresholdText}>
                Threshold: <Text style={styles.thresholdValue}>{exam.pass_mark}%</Text>
              </Text>
              <TouchableOpacity
                style={styles.manageBtn}
                onPress={() => router.push({ pathname: '/admin/add-question', params: { examId: exam.id } })}>
                <Text style={styles.manageBtnText}>Manage →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* RESULTS SECTION */}
      <View style={styles.resultsSection}>
        <Text style={styles.resultsTitle}>Student Performance</Text>
        <Text style={styles.resultsSubtitle}>Real-time scores and passing status of all exam attempts.</Text>
        <ResultsTable />
      </View>

      {/* DELETE MODAL */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalIcon}>🗑️</Text>
              <Text style={styles.modalTitle}>Confirm Deletion</Text>
            </View>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete{' '}
              <Text style={styles.modalExamName}>{examToDelete?.title}</Text>?
              This will remove <Text style={{ fontWeight: '800' }}>ALL questions and results</Text>.
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDelete} onPress={confirmDelete}>
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

  // Header
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12,
  },
  title: {
    fontSize: 22, fontWeight: '900', color: '#0f172a',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  subtitle: { fontSize: 13, color: '#64748b', fontWeight: '500', marginTop: 2 },
  createBtn: {
    backgroundColor: '#4f46e5', paddingHorizontal: 16,
    paddingVertical: 10, borderRadius: 12,
    shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  createBtnText: { color: '#fff', fontWeight: '900', fontSize: 13 },

  // Section
  sectionLabel: {
    fontSize: 10, fontWeight: '900', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14,
  },
  emptyText: { color: '#94a3b8', fontSize: 14, textAlign: 'center', marginTop: 20 },

  // Exam card
  examCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: '#f1f5f9', marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  deleteIcon: {
    position: 'absolute', top: 14, right: 14,
    padding: 8, borderRadius: 20,
  },
  deleteIconText: { fontSize: 18 },
  examTitle: {
    fontSize: 16, fontWeight: '900', color: '#1e293b',
    marginRight: 32, marginBottom: 6,
  },
  examDesc: { fontSize: 13, color: '#64748b', lineHeight: 18, marginBottom: 16 },
  examFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#f8fafc',
    padding: 12, borderRadius: 14,
  },
  thresholdText: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' },
  thresholdValue: { color: '#0f172a' },
  manageBtn: {
    backgroundColor: '#fff', paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 8,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  manageBtnText: { color: '#4f46e5', fontWeight: '900', fontSize: 13 },

  // Results section
  resultsSection: {
    marginTop: 28, paddingTop: 20,
    borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  resultsTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' },
  resultsSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 2, marginBottom: 16 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24,
    width: '100%', maxWidth: 360,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  modalIcon: { fontSize: 22 },
  modalTitle: { fontSize: 17, fontWeight: '900', color: '#0f172a' },
  modalMessage: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 20 },
  modalExamName: { fontWeight: '700', color: '#0f172a' },
  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalCancel: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 10, backgroundColor: '#e2e8f0',
  },
  modalCancelText: { color: '#475569', fontWeight: '700' },
  modalDelete: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 10, backgroundColor: '#ef4444',
  },
  modalDeleteText: { color: '#fff', fontWeight: '700' },
});
