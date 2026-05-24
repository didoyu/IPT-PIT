import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { useRouter, Stack } from 'expo-router'; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Trash2, LogOut } from 'lucide-react-native';
import api from '../../services/api';

function TemporaryResultsView() {
  return (
    <View style={{ padding: 16, backgroundColor: '#ffffff', borderRadius: 16, alignItems: 'center' }}>
      <Text style={{ color: '#64748b', fontSize: 14 }}>Results list will appear here...</Text>
    </View>
  );
}

interface Exam {
  id: number;
  title: string;
  description: string;
  pass_mark: number;
}

export default function AdminDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  
  const router = useRouter();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('exams/');
        setExams(res.data);
      } catch (err) {
        console.error("Failed to fetch exams", err);
        Alert.alert("Connection Failed", "Could not fetch exam modules.");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleDeleteClick = (exam: Exam) => {
    setExamToDelete(exam);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!examToDelete) return;
    try {
      await api.delete(`exams/${examToDelete.id}/`);
      setExams(exams.filter(e => e.id !== examToDelete.id));
      setShowDeleteModal(false);
      setExamToDelete(null);
    } catch (err) {
      Alert.alert("Deletion Error", "Could not complete request to delete this module.");
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Dashboard Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Admin Panel</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButtonInline}>
              <LogOut size={16} color="#64748b" />
              <Text style={styles.logoutTextInline}>Sign Out</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>Manage exams, questions, and view student performance.</Text>
        </View>

        {/* Active Exam Modules */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Active Exam Modules</Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#4f46e5" style={{ marginTop: 20 }} />
          ) : exams.length === 0 ? (
            <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 20 }}>No active exams found.</Text>
          ) : (
            exams.map((exam) => (
              <View key={exam.id} style={styles.examCard}>
                
                {/* ISOLATED DELETE PRESSABLE */}
                <TouchableOpacity 
                  onPress={() => handleDeleteClick(exam)}
                  style={styles.deleteButton}
                  activeOpacity={0.7}
                >
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>

                {/* MAIN TOUCHABLE WRAPPER FOR EDIT/UPDATE ROUTING */}
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={() => {
                    router.push({
                      pathname: '/(admin)/add-question/[examId]',
                      params: { examId: exam.id }
                    });
                  }}
                >
                  <Text style={styles.examTitle}>{exam.title}</Text>
                  <Text style={styles.examDescription} numberOfLines={2}>
                    {exam.description}
                  </Text>
                  
                  <View style={styles.cardFooter}>
                    <Text style={styles.thresholdText}>
                      Threshold: <Text style={styles.boldText}>{exam.pass_mark}%</Text>
                    </Text>
                    <Text style={styles.manageLinkText}>Manage Sync →</Text>
                  </View>
                </TouchableOpacity>

              </View>
            ))
          )}
        </View>

        {/* Student Performance */}
        <View style={styles.resultsSection}>
          <Text style={styles.sectionTitle}>Student Performance</Text>
          <Text style={styles.sectionSubtitle}>Real-time scores and passing status.</Text>
          <TemporaryResultsView />
        </View>
      </ScrollView>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Trash2 size={24} color="#ef4444" />
              <Text style={styles.modalTitle}>Confirm Deletion</Text>
            </View>
            
            <Text style={styles.modalText}>
              Are you sure you want to delete <Text style={styles.boldText}>{examToDelete?.title}</Text>? This will permanently remove all associated questions and results.
            </Text>
            
            <View style={styles.modalActionRow}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmDeleteButton]} 
                onPress={confirmDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 24, marginTop: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#64748b', marginTop: 6, fontWeight: '500' },
  logoutButtonInline: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 6 },
  logoutTextInline: { color: '#475569', fontWeight: '700', fontSize: 13 },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 12, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 12 },
  examCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9', position: 'relative', elevation: 2 },
  deleteButton: { position: 'absolute', top: 16, right: 16, padding: 8, borderRadius: 99, backgroundColor: '#fef2f2', zIndex: 10 },
  examTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b', paddingRight: 40 },
  examDescription: { fontSize: 14, color: '#64748b', marginTop: 6, lineHeight: 20, paddingRight: 10 },
  cardFooter: { marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 16 },
  thresholdText: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
  boldText: { color: '#0f172a', fontWeight: '900' },
  manageLinkText: { fontSize: 11, fontWeight: '900', color: '#4f46e5', textTransform: 'uppercase' },
  resultsSection: { marginTop: 12, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' },
  sectionSubtitle: { fontSize: 13, color: '#94a3b8', marginBottom: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#ffffff', borderRadius: 28, padding: 24, width: '100%', maxWidth: 340, elevation: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a', marginLeft: 10 },
  modalText: { fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 24 },
  modalActionRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginLeft: 10 },
  cancelButton: { backgroundColor: '#e2e8f0' },
  cancelButtonText: { color: '#475569', fontWeight: '700' },
  confirmDeleteButton: { backgroundColor: '#ef4444' },
  deleteButtonText: { color: '#ffffff', fontWeight: '700' },
});