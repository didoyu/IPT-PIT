import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  SafeAreaView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, Compass, ChevronRight, Layers } from 'lucide-react-native';
import api from '../../services/api';

interface Exam {
  id: number;
  title: string;
  description: string;
  pass_mark: number;
}

export default function ExamList() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('exams/');
        setExams(res.data);
      } catch (err) {
        console.error("Error fetching exams:", err);
        Alert.alert("Sync Error", "Could not load available assessment modules.");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loaderText}>Synchronizing Exam Registry...</Text>
        <ActivityIndicator size="small" color="#7e22ce" style={{ marginTop: 10 }} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 🔮 CORE STUDENT PORTAL HEADER PANEL */}
        <View style={styles.headerBlock}>
          <View style={styles.badgeRow}>
            <Compass size={14} color="#7e22ce" style={styles.headerIcon} />
            <Text style={styles.headerTagline}>Student Portal Terminal</Text>
          </View>
          <Text style={styles.headerTitle}>Available Modules</Text>
          <Text style={styles.headerSubtitle}>
            Select an active assessment node below. Ensure your environment matches parameters before launching execution blocks.
          </Text>
        </View>

        {/* METRICS TRACK BAR */}
        <View style={styles.trackBar}>
          <View style={styles.trackBadge}>
            <Layers size={13} color="#7e22ce" style={{ marginRight: 5 }} />
            <Text style={styles.trackBadgeText}>{exams.length} TOTAL ASSIGNED</Text>
          </View>
        </View>

        {/* EXAM CARDS GRID CONTAINER */}
        {exams.length === 0 ? (
          <View style={styles.emptyCard}>
            <BookOpen size={32} color="#94a3b8" />
            <Text style={styles.emptyTextTitle}>No Active Modules</Text>
            <Text style={styles.emptyTextSub}>No examinations are currently assigned to your account profile.</Text>
          </View>
        ) : (
          exams.map((exam) => (
            <TouchableOpacity 
              key={exam.id} 
              style={styles.examCard}
              activeOpacity={0.75}
              onPress={() => 
                router.push({
                  pathname: '/(student)/take-exam/[id]' as any,
                  params: { id: String(exam.id) }
                })
              }
            >
              {/* Top Accent Strip */}
              <View style={styles.cardAccentStrip} />

              {/* Module Metadata Headers */}
              <View style={styles.cardTopMeta}>
                <View style={styles.onlineBlockBadge}>
                  <Text style={styles.onlineBlockText}>ONLINE BLOCK</Text>
                </View>
                <Text style={styles.examIdText}>ID: #{exam.id}</Text>
              </View>

              {/* Core Content */}
              <Text style={styles.examTitle}>{exam.title}</Text>
              <Text style={styles.examDescription} numberOfLines={3}>
                {exam.description || "No supplemental descriptor context profile provided for this baseline framework track module."}
              </Text>

              {/* Refined Footer Action Block */}
              <View style={styles.cardFooter}>
                <View style={styles.thresholdWrapper}>
                  <Text style={styles.thresholdLabel}>Target Pass</Text>
                  <Text style={styles.purpleBoldText}>{exam.pass_mark}% Score</Text>
                </View>
                
                <View style={styles.startLinkWrapper}>
                  <Text style={styles.startLinkText}>START</Text>
                  <ChevronRight size={12} color="#7e22ce" style={{ marginLeft: 2 }} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingBottom: 60 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loaderText: { fontSize: 10, fontWeight: '900', color: '#7e22ce', textTransform: 'uppercase', letterSpacing: 1.2 },

  // 🔮 Unified Capsule Header Design
  headerBlock: {
    backgroundColor: 'rgba(243, 232, 255, 0.5)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(126, 34, 206, 0.12)',
    marginBottom: 20,
    marginTop: 8,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  headerIcon: { marginRight: 4 },
  headerTagline: { fontSize: 10, fontWeight: '900', color: '#7e22ce', textTransform: 'uppercase', letterSpacing: 1.2 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' },
  headerSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },

  // Control Status Bar
  trackBar: { flexDirection: 'row', marginBottom: 16, paddingHorizontal: 4 },
  trackBadge: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  trackBadgeText: { fontSize: 10, fontWeight: '900', color: '#475569', letterSpacing: 0.5 },

  // Native Architecture Card Patterns 
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
  cardTopMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  onlineBlockBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#e2e8f0' },
  onlineBlockText: { fontSize: 9, fontWeight: '900', color: '#475569', letterSpacing: 0.5 },
  examIdText: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 0.5 },
  examTitle: { fontSize: 17, fontWeight: '900', color: '#0f172a', lineHeight: 22 },
  examDescription: { fontSize: 13, color: '#64748b', marginTop: 6, lineHeight: 19, paddingRight: 4 },
  
  // Footer Blocks Layout
  cardFooter: { 
    marginTop: 18, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: 'rgba(126, 34, 206, 0.03)', 
    padding: 12, 
    borderRadius: 14 
  },
  thresholdWrapper: { flexDirection: 'column' },
  thresholdLabel: { fontSize: 9, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  purpleBoldText: { color: '#7e22ce', fontWeight: '900', fontSize: 13, marginTop: 1 },
  startLinkWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(126, 34, 206, 0.15)' },
  startLinkText: { fontSize: 11, fontWeight: '900', color: '#7e22ce', letterSpacing: 0.5 },

  // System Empty States
  emptyCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0', marginTop: 24 },
  emptyTextTitle: { color: '#0f172a', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', marginTop: 8, letterSpacing: 0.5 },
  emptyTextSub: { color: '#64748b', fontSize: 12, textAlign: 'center', fontWeight: '500', lineHeight: 18, marginTop: 4 },
});
