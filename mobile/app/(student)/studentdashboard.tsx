import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Award, Layers, CheckCircle2, AlertCircle } from 'lucide-react-native';
import api from "../../services/api";

interface ExamResult {
  id: number;
  exam_title: string;
  date: string;
  score: number;
  total_questions: number;
  pass_mark?: number;
}

export default function StudentDashboard() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); 

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = await AsyncStorage.getItem("auth");
        const res = await api.get("student-results/", {
          headers: { 
            Authorization: `Token ${token}` 
          },
        });
        setResults(res.data);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loaderText}>Synchronizing Academic Registry...</Text>
        <ActivityIndicator size="small" color="#7e22ce" style={{ marginTop: 10 }} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 🔮 UNIFIED CAPSULE HEADER PANEL */}
        <View style={styles.headerBlock}>
          <View style={styles.headerTopRow}>
            <View style={styles.badgeRow}>
              <Award size={14} color="#7e22ce" style={styles.headerIcon} />
              <Text style={styles.headerTagline}>Academic Records</Text>
            </View>
          </View>
          
          <Text style={styles.headerTitle}>My Results</Text>
          <Text style={styles.headerSubtitle}>
            Track real-time baseline completions and evaluate score metrics.
          </Text>
        </View>

        {/* METRICS TRACK BAR */}
        <View style={styles.trackBar}>
          <View style={styles.trackBadge}>
            <Layers size={13} color="#7e22ce" style={{ marginRight: 5 }} />
            <Text style={styles.trackBadgeText}>Performance History Engine</Text>
          </View>
        </View>

        {/* PERFORMANCE CARDS GRID CONTAINER */}
        {results.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTextSub}>No verification tokens found.</Text>
          </View>
        ) : (
          results.map((res) => {
            const totalQuestions = res.total_questions || 1;
            const percentage = (res.score / totalQuestions) * 100;
            const threshold = res.pass_mark || 50;
            const isPassed = percentage >= threshold;

            return (
              <View key={res.id} style={styles.examCard}>
                {/* Top Decorative Accent Strip */}
                <View style={[styles.cardAccentStrip, isPassed ? styles.stripSuccess : styles.stripFail]} />

                {/* Card Top Meta Row */}
                <View style={styles.cardTopMeta}>
                  <View
                    style={[
                      styles.statusBadge,
                      isPassed ? styles.badgeSuccess : styles.badgeFail,
                    ]}
                  >
                    {isPassed ? (
                      <CheckCircle2 size={10} color="#16a34a" style={{ marginRight: 4 }} />
                    ) : (
                      <AlertCircle size={10} color="#dc2626" style={{ marginRight: 4 }} />
                    )}
                    <Text
                      style={[
                        styles.badgeText,
                        isPassed ? styles.badgeTextSuccess : styles.badgeTextFail,
                      ]}
                    >
                      {isPassed ? "PASSED" : "RETAKE"}
                    </Text>
                  </View>
                  
                  <Text style={styles.examIdText}>{res.date}</Text>
                </View>

                {/* Core Module Title */}
                <Text style={styles.examTitle}>{res.exam_title}</Text>
                
                {/* Score Summary Block */}
                <Text style={styles.scoreSummaryText}>
                  {res.score} / {res.total_questions} Points
                </Text>

                {/* Progress Rail Alignment */}
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      isPassed ? styles.fillSuccess : styles.fillFail,
                      { width: `${Math.min(percentage, 100)}%` },
                    ]}
                  />
                </View>

                {/* Refined Metric Footer Layout */}
                <View style={styles.cardFooter}>
                  <View style={styles.footerMetricWrapper}>
                    <Text style={styles.metricLabel}>Achieved</Text>
                    <Text style={styles.metricValueText}>{percentage.toFixed(0)}%</Text>
                  </View>
                  
                  <View style={[styles.footerMetricWrapper, { alignItems: 'flex-end' }]}>
                    <Text style={styles.metricLabel}>Req.</Text>
                    <Text style={styles.purpleBoldText}>{threshold}%</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* 💬 FLOATING CHATBOT ACTION ICON */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/chatbotMobile')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>💬</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingBottom: 110 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loaderText: { fontSize: 10, fontWeight: '900', color: '#7e22ce', textTransform: 'uppercase', letterSpacing: 1.2 },

  // 🔮 Capsule Header Architecture Block
  headerBlock: {
    backgroundColor: 'rgba(243, 232, 255, 0.5)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(126, 34, 206, 0.12)',
    marginBottom: 20,
    marginTop: 8,
  },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { marginRight: 4 },
  headerTagline: { fontSize: 10, fontWeight: '900', color: '#7e22ce', textTransform: 'uppercase', letterSpacing: 1.2 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#0f172a', textTransform: 'uppercase' },
  headerSubtitle: { fontSize: 13, color: '#64748b', marginTop: 4, lineHeight: 18 },

  // Engine Status Track Strip
  trackBar: { flexDirection: 'row', marginBottom: 16, paddingHorizontal: 4 },
  trackBadge: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center' },
  trackBadgeText: { fontSize: 10, fontWeight: '900', color: '#475569', letterSpacing: 0.5, textTransform: 'uppercase' },

  // Exam Result Structural Architecture Cards
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
  cardAccentStrip: { position: 'absolute', top: 0, left: 24, width: 40, height: 3.5, borderBottomLeftRadius: 4, borderBottomRightRadius: 4 },
  stripSuccess: { backgroundColor: '#10b981' },
  stripFail: { backgroundColor: '#ef4444' },
  cardTopMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  
  // Custom Action Status Badges
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  badgeSuccess: { backgroundColor: '#f0fdf4', borderColor: 'rgba(22, 163, 74, 0.2)' },
  badgeFail: { backgroundColor: '#fef2f2', borderColor: 'rgba(220, 38, 38, 0.2)' },
  badgeText: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  badgeTextSuccess: { color: '#16a34a' },
  badgeTextFail: { color: '#dc2626' },
  examIdText: { fontSize: 10, fontWeight: '900', color: '#94a3b8', letterSpacing: 0.5 },
  
  // Card Text Layouts
  examTitle: { fontSize: 17, fontWeight: '900', color: '#0f172a', lineHeight: 22 },
  scoreSummaryText: { fontSize: 12, fontWeight: "700", color: "#64748b", marginTop: 4, marginBottom: 12 },
  
  // Custom Analytical Progress Rails
  progressBarTrack: { height: 8, backgroundColor: "#f1f5f9", borderRadius: 99, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 99 },
  fillSuccess: { backgroundColor: "#10b981" },
  fillFail: { backgroundColor: "#ef4444" },
  
  // Lower Card Metric Footers
  cardFooter: { 
    marginTop: 16, 
    paddingTop: 12, 
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center'
  },
  footerMetricWrapper: { flexDirection: 'column' },
  metricLabel: { fontSize: 9, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  metricValueText: { fontSize: 13, fontWeight: '900', color: '#1e293b', marginTop: 1 },
  purpleBoldText: { color: '#7e22ce', fontWeight: '900', fontSize: 13, marginTop: 1 },

  // System Empty Container Panels
  emptyCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e2e8f0', marginTop: 24 },
  emptyTextSub: { color: '#94a3b8', fontSize: 12, textAlign: 'center', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  // Floating Action Chatbot Elements
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#7e22ce",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  fabIcon: { fontSize: 24, color: "#ffffff" },
});