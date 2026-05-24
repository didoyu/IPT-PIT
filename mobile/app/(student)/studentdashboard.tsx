import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity, // ✅ Added for the logout action button
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router"; // ✅ Added to handle redirection
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const router = useRouter(); // ✅ Initialize router instance

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

  // ✅ Wipes local storage clear and sends you straight back to the sign-in prompt
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace("/login"); // Adjust to "/" if your login file is standard index route
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading Results...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#f8fafc", "#f1f5f9"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            {/* ✅ Flex layout to split the Title text and the Action button cleanly */}
            <View style={styles.headerTopRow}>
              <Text style={styles.title}>My Results</Text>
              
              <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.logoutButtonText}>Log Out</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.subtitle}>
              Track your performance and completed modules.
            </Text>
          </View>

          {/* Performance History Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeader}>Performance History</Text>
            
            {results.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No exam attempts recorded yet.</Text>
              </View>
            ) : (
              results.map((res) => {
                const totalQuestions = res.total_questions || 1;
                const percentage = (res.score / totalQuestions) * 100;
                const threshold = res.pass_mark || 50;
                const isPassed = percentage >= threshold;

                return (
                  <View key={res.id} style={styles.card}>
                    {/* Top Row: Title & Status Badge */}
                    <View style={styles.cardHeader}>
                      <View style={styles.titleWrapper}>
                        <Text style={styles.examTitle}>{res.exam_title}</Text>
                        <Text style={styles.dateText}>{res.date}</Text>
                      </View>
                      
                      <View style={styles.statusWrapper}>
                        <View
                          style={[
                            styles.badge,
                            isPassed ? styles.badgeSuccess : styles.badgeFail,
                          ]}
                        >
                          <Text
                            style={[
                              styles.badgeText,
                              isPassed ? styles.badgeTextSuccess : styles.badgeTextFail,
                            ]}
                          >
                            {isPassed ? "MODULE COMPLETED" : "RETAKE REQUIRED"}
                          </Text>
                        </View>
                        <Text style={styles.scoreText}>
                          {res.score} / {res.total_questions} Points
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar Track */}
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          isPassed ? styles.fillSuccess : styles.fillFail,
                          { width: `${Math.min(percentage, 100)}%` },
                        ]}
                      />
                    </View>

                    {/* Bottom Row: Score Stats */}
                    <View style={styles.cardFooter}>
                      <Text style={styles.achievedText}>
                        ACHIEVED: {percentage.toFixed(0)}%
                      </Text>
                      <Text style={styles.requiredText}>
                        REQUIRED: {threshold}%
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#64748b",
  },
  header: {
    marginBottom: 32,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  logoutButtonText: {
    color: "#dc2626",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.5,
    textTransform: "uppercase",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "500",
    color: "#64748b",
    lineHeight: 22,
  },
  sectionContainer: {
    flex: 1,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "900",
    color: "#94a3b8",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 30,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  emptyText: {
    color: "#94a3b8",
    fontStyle: "italic",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    elevation: 2,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  titleWrapper: {
    flex: 1,
    paddingRight: 12,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    lineHeight: 24,
  },
  dateText: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  statusWrapper: {
    alignItems: "flex-end",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  badgeSuccess: {
    backgroundColor: "#dcfce7",
  },
  badgeFail: {
    backgroundColor: "#fee2e2",
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  badgeTextSuccess: {
    color: "#16a34a",
  },
  badgeTextFail: {
    color: "#dc2626",
  },
  scoreText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#475569",
    marginTop: 8,
  },
  progressBarTrack: {
    height: 14,
    backgroundColor: "#f1f5f9",
    borderRadius: 99,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f8fafc",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 99,
  },
  fillSuccess: {
    backgroundColor: "#22c55e",
  },
  fillFail: {
    backgroundColor: "#ef4444",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  achievedText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#94a3b8",
  },
  requiredText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#6366f1",
    textTransform: "uppercase",
    fontStyle: "italic",
  },
});