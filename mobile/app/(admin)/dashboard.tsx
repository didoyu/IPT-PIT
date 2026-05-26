import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator,
  Alert,
  SafeAreaView
} from 'react-native';
import { useRouter } from 'expo-router'; 
import { Trash2, MessageSquare, Shield, Layers, GraduationCap, ChevronRight, CheckCircle2, XCircle } from 'lucide-react-native';
import api from '../../services/api';

interface Exam {
  id: number;
  title: string;
  description: string;
  pass_mark: number;
}

interface StudentResult {
  id: number;
  student_name: string;
  exam_title: string;
  score: number;
  total_questions: number;
  percentage: number;
  passed: boolean;
}

export default function AdminDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingResults, setLoadingResults] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  
  const router = useRouter();

  // Fetch Exams & Results simultaneously
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('exams/');
        setExams(res.data);
      } catch (err) {
        console.error("Failed to fetch exams", err);
        Alert.alert("Connection Failed", "Could not fetch exam modules.");
      } finally {
        setLoadingExams(false);
      }
    };

    const fetchResults = async () => {
      try {
        // Adjust endpoint string matching your Django backend router if needed
        const res = await api.get('admin-results/');
        setResults(res.data);
      } catch (err) {
        console.error("Failed to fetch results", err);
        // Silently handle or fallback without breaking the main exam view layout
      } finally {
        setLoadingResults(false);
      }
    };

    fetchExams();
    fetchResults();
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 🔮 CORE ADMIN HEADER PANEL */}
        <View style={styles.headerBlock}>
          <View style={styles.badgeRow}>
            <Shield size={14} color="#7e22ce" style={styles.headerIcon} />
            <Text style={styles.headerTagline}>Management Core</Text>
          </View>
          <Text style={styles.headerTitle}>Admin Panel</Text>
          <Text style={styles.headerSubtitle}>
            Manage exams, questions, and view student performance.
          </Text>
          
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => router.push('/(admin)/create-exam')}
            style={styles.createExamBtn}
          >
            <Text style={styles.createExamBtnText}>+ CREATE EXAM</Text>
          </TouchableOpacity>
        </View>

        {/* EXAM MODULES SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Layers size={15} color="#9333ea" style={{ marginRight: 6 }} />
            <Text style={styles.sectionLabel}>Active Exam Modules</Text>
          </View>
          
          {loadingExams ? (
            <ActivityIndicator size="large" color="#7e22ce" style={styles.loaderSpacing} />
          ) : exams.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateText}>No active exams found.</Text>
            </View>
          ) : (
            <ExamsList exams={exams} onDeleteClick={handleDeleteClick} router={router} />
          )}
        </View>

        {/* STUDENT PERFORMANCE SECTION (Mobile Tables are Lists) */}
        <View style={styles.resultsSection}>
          <View style={styles.resultsHeader}>
            <View style={styles.sectionHeaderRow}>
              <GraduationCap size={18} color="#0f172a" style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>Student Performance</Text>
            </View>
            <Text style={styles.sectionSubtitleText}>
              Real-time scores and passing status of all exam attempts.
            </Text>
          </View>
          
          {loadingResults ? (
            <ActivityIndicator size="small" color="#7e22ce" style={styles.loaderSpacing} />
          ) : results.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Text style={styles.placeholderText}>No student records or attempts found yet.</Text>
            </View>
          ) : (
            <View style={styles.resultsContainerCard}>
              {results.map((item, index) => (
                <View 
                  key={item.id} 
                  style={[
                    styles.resultRow, 
                    index === results.length - 1 && { borderBottomWidth: 0 }
                  ]}
                >
                  <View style={styles.resultInfoLeft}>
                    <Text style={styles.studentNameText}>{item.student_name}</Text>
                    <Text style={styles.studentExamSub}>{item.exam_title}</Text>
                  </View>

                  <View style={styles.resultMetricsRight}>
                    <Text style={styles.scorePercentageText}>{item.percentage}%</Text>
                    <View style={[styles.statusBadge, item.passed ? styles.passBadge : styles.failBadge]}>
                      {item.passed ? (
                        <CheckCircle2 size={10} color="#16a34a" style={{ marginRight: 3 }} />
                      ) : (
                        <XCircle size={10} color="#dc2626" style={{ marginRight: 3 }} />
                      )}
                      <Text style={[styles.statusBadgeText, item.passed ? styles.passText : styles.failText]}>
                        {item.passed ? "PASSED" : "FAILED"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 💬 FLOATING CHATBOT BUTTON */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/chatbotMobile')}
        activeOpacity={0.85}
      >
        <MessageSquare size={24} color="#ffffff" />
      </TouchableOpacity>

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
              <View style={styles.modalIconBg}>
                <Trash2 size={20} color="#ef4444" />
              </View>
              <Text style={styles.modalTitle}>Confirm Deletion</Text>
            </View>
            
            <Text style={styles.modalText}>
              Are you sure you want to delete <Text style={styles.boldText}>{examToDelete?.title}</Text>? This will permanently remove <Text style={{ fontWeight: '700' }}>ALL questions and results</Text>.
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
    </SafeAreaView>
  );
}

function ExamsList({ exams, onDeleteClick, router }: { exams: Exam[], onDeleteClick: (exam: Exam) => void, router: any }) {
  return (
    <>
      {exams.map((exam) => (
        <View key={exam.id} style={styles.examCard}>
          <View style={styles.cardAccentStrip} />

          {/* Expanded clear touch target for delete */}
          <TouchableOpacity 
            onPress={() => onDeleteClick(exam)}
            style={styles.deleteButton}
            activeOpacity={0.6}
          >
            <Trash2 size={16} color="#ef4444" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
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
                Threshold: <Text style={styles.purpleBoldText}>{exam.pass_mark}%</Text>
              </Text>
              <View style={styles.manageLinkWrapper}>
                <Text style={styles.manageLinkText}>Manage</Text>
                <ChevronRight size={12} color="#7e22ce" style={{ marginLeft: 2 }} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingBottom: 110 },
  loaderSpacing: { marginTop: 20 },
  
  // Mobile Header Layout Configuration
  headerBlock: {
    backgroundColor: 'rgba(243, 232, 255, 0.5)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(126, 34, 206, 0.12)',
    marginBottom: 28,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  headerIcon: { marginRight: 4 },
  headerTagline: { fontSize: 10, fontWeight: '900', color: '#7e22ce', textTransform: 'uppercase', letterSpacing: 1.2 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' },
  headerSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18, marginBottom: 16 },
  
  createExamBtn: {
    backgroundColor: '#7e22ce',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
  },
  createExamBtnText: { color: '#ffffff', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },

  // Sections
  section: { marginBottom: 28 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionLabel: { fontSize: 11, fontWeight: '900', color: '#9333ea', textTransform: 'uppercase', letterSpacing: 1.2 },
  emptyStateCard: { padding: 20, backgroundColor: '#ffffff', borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  emptyStateText: { color: '#64748b', fontSize: 13 },

  // Native Optimized Cards (No width variations or translations)
  examCard: { 
    backgroundColor: '#ffffff', 
    borderRadius: 24, 
    padding: 20, 
    marginBottom: 14, 
    borderWidth: 1, 
    borderColor: 'rgba(126, 34, 206, 0.12)', 
    position: 'relative', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1 
  },
  cardAccentStrip: { position: 'absolute', top: 0, left: 24, width: 40, height: 3.5, backgroundColor: '#7e22ce', borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  deleteButton: { position: 'absolute', top: 14, right: 14, padding: 10, borderRadius: 99, backgroundColor: '#fef2f2', zIndex: 10 },
  examTitle: { fontSize: 17, fontWeight: '900', color: '#0f172a', paddingRight: 45 },
  examDescription: { fontSize: 13, color: '#64748b', marginTop: 6, lineHeight: 19, paddingRight: 8 },
  
  cardFooter: { 
    marginTop: 16, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: 'rgba(126, 34, 206, 0.03)', 
    padding: 12, 
    borderRadius: 14 
  },
  thresholdText: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' },
  boldText: { color: '#0f172a', fontWeight: '900' },
  purpleBoldText: { color: '#7e22ce', fontWeight: '900' },
  manageLinkWrapper: { flexDirection: 'row', alignItems: 'center' },
  manageLinkText: { fontSize: 12, fontWeight: '900', color: '#7e22ce' },

  // Mobile Student Performance Layout
  resultsSection: { marginTop: 4, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  resultsHeader: { marginBottom: 14 },
  sectionTitle: { fontSize: 19, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' },
  sectionSubtitleText: { fontSize: 13, color: '#64748b', marginTop: 2 },
  
  resultsContainerCard: { 
    backgroundColor: '#ffffff', 
    borderRadius: 24, 
    borderWidth: 1, 
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    overflow: 'hidden'
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  resultInfoLeft: { flex: 1, paddingRight: 12 },
  studentNameText: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
  studentExamSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  
  resultMetricsRight: { alignItems: 'flex-end' },
  scorePercentageText: { fontSize: 14, fontWeight: '900', color: '#0f172a' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  passBadge: { backgroundColor: '#f0fdf4' },
  failBadge: { backgroundColor: '#fef2f2' },
  statusBadgeText: { fontSize: 9, fontWeight: '900' },
  passText: { color: '#16a34a' },
  failText: { color: '#dc2626' },
  placeholderText: { color: '#94a3b8', fontSize: 13 },

  // Modal Configuration
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#ffffff', borderRadius: 24, padding: 24, width: '100%', maxWidth: 320, elevation: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  modalIconBg: { padding: 10, backgroundColor: '#fef2f2', borderRadius: 12, marginRight: 10 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  modalText: { fontSize: 14, color: '#475569', lineHeight: 22, marginBottom: 20 },
  modalActionRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginLeft: 10 },
  cancelButton: { backgroundColor: '#f1f5f9' },
  cancelButtonText: { color: '#475569', fontWeight: '700' },
  confirmDeleteButton: { backgroundColor: '#ef4444' },
  deleteButtonText: { color: '#ffffff', fontWeight: '700' },
  
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#7e22ce',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7e22ce',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 99,
  },
});