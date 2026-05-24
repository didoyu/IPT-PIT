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
import { Award, BookOpen, ChevronRight } from 'lucide-react-native';
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
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Available Exams</Text>
          <Text style={styles.headerSubtitle}>Select an active module to begin your academic assessment.</Text>
        </View>

        {exams.length === 0 ? (
          <View style={styles.emptyCard}>
            <BookOpen size={40} color="#94a3b8" />
            <Text style={styles.emptyText}>No examinations are currently assigned to your account.</Text>
          </View>
        ) : (
          exams.map((exam) => (
            <TouchableOpacity 
              key={exam.id} 
              style={styles.examCard}
              activeOpacity={0.7}
              onPress={() => 
                router.push({
                pathname: '/(student)/take-exam/[id]' as any, // 👈 'as any' tells TypeScript to trust you
                params: { id: String(exam.id) }
  })
}
            >
              <View style={styles.cardMain}>
                <View style={styles.iconContainer}>
                  <BookOpen size={20} color="#4f46e5" />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.examTitle}>{exam.title}</Text>
                  <Text style={styles.examDescription} numberOfLines={2}>
                    {exam.description}
                  </Text>
                </View>
                <ChevronRight size={18} color="#94a3b8" />
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.badgeRow}>
                  <Award size={12} color="#4f46e5" />
                  <Text style={styles.badgeText}>
                    Pass Mark: <Text style={styles.boldText}>{exam.pass_mark}%</Text>
                  </Text>
                </View>
                <Text style={styles.actionText}>START EXAM</Text>
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
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 28, marginTop: 16 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: '#64748b', marginTop: 6, fontWeight: '500', lineHeight: 20 },
  examCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9', elevation: 2 },
  cardMain: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#e0e7ff', justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 14, paddingRight: 8 },
  examTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  examDescription: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderRadius: 16 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  boldText: { color: '#4f46e5', fontWeight: '900' },
  actionText: { fontSize: 11, fontWeight: '900', color: '#4f46e5', letterSpacing: 0.5 },
  emptyCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0', marginTop: 40, gap: 12 },
  emptyText: { color: '#64748b', fontSize: 14, textAlign: 'center', fontWeight: '500', lineHeight: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
});