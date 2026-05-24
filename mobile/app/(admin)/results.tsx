import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../services/api";

interface ExamRecord {
  id: number;
  student_name: string;
  section: string;
  school_year: string;
  exam_title: string;
  score: number;
  total_questions: number;
  date: string;
}

export default function ResultsTable() {
  const [results, setResults] = useState<ExamRecord[]>([]);
  const [filteredResults, setFilteredResults] = useState<ExamRecord[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = await AsyncStorage.getItem("auth");
        const res = await api.get("admin-results/", {
          headers: { Authorization: `Token ${token}` },
        });
        setResults(res.data || []);
        setFilteredResults(res.data || []);
      } catch (err) {
        console.error("Error fetching results", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  useEffect(() => {
    if (!results || results.length === 0) return;

    const uniqueSections = [
      ...new Set(
        results
          .map((r) => r.section)
          .filter((sec) => sec && sec.toLowerCase() !== "n/a")
      ),
    ];

    const uniqueYears = [
      ...new Set(
        results
          .map((r) => r.school_year)
          .filter((yr) => yr && yr.toLowerCase() !== "n/a")
      ),
    ];

    setSections(uniqueSections);
    setYears(uniqueYears);
  }, [results]);

  useEffect(() => {
    if (!results) return;

    const filtered = results.filter((r) => {
      const matchSection = selectedSection
        ? r.section?.trim() === selectedSection.trim()
        : true;

      const matchYear = selectedYear
        ? r.school_year?.trim() === selectedYear.trim()
        : true;

      return matchSection && matchYear;
    });

    setFilteredResults(filtered);
  }, [selectedSection, selectedYear, results]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Student Results</Text>

        <Text style={styles.filterLabel}>Filter By Section</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTray}>
          <TouchableOpacity
            style={[styles.chip, selectedSection === "" && styles.activeChip]}
            onPress={() => setSelectedSection("")}
          >
            <Text style={[styles.chipText, selectedSection === "" && styles.activeChipText]}>All Sections</Text>
          </TouchableOpacity>
          {sections.map((sec) => (
            <TouchableOpacity
              key={sec}
              style={[styles.chip, selectedSection === sec && styles.activeChip]}
              onPress={() => setSelectedSection(sec)}
            >
              <Text style={[styles.chipText, selectedSection === sec && styles.activeChipText]}>{sec}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.filterLabel}>Filter By School Year</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTray}>
          <TouchableOpacity
            style={[styles.chip, selectedYear === "" && styles.activeChip]}
            onPress={() => setSelectedYear("")}
          >
            <Text style={[styles.chipText, selectedYear === "" && styles.activeChipText]}>All Years</Text>
          </TouchableOpacity>
          {years.map((yr) => (
            <TouchableOpacity
              key={yr}
              style={[styles.chip, selectedYear === yr && styles.activeChip]}
              onPress={() => setSelectedYear(yr)}
            >
              <Text style={[styles.chipText, selectedYear === yr && styles.activeChipText]}>{yr}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionHeader}>Records ({filteredResults.length})</Text>
        {filteredResults.map((res) => {
          const totalQuestions = res.total_questions || 1;
          const percentage = (res.score / totalQuestions) * 100;
          const isPassed = percentage >= 50;

          return (
            <View key={res.id} style={styles.resultCard}>
              <View style={styles.cardTopRow}>
                <View>
                  <Text style={styles.studentName}>{res.student_name}</Text>
                  <Text style={styles.metaText}>
                    Section {res.section} • {res.school_year}
                  </Text>
                </View>
                <View style={[styles.statusBadge, isPassed ? styles.passBadge : styles.failBadge]}>
                  <Text style={[styles.statusBadgeText, isPassed ? styles.passBadgeText : styles.failBadgeText]}>
                    {isPassed ? "PASSED" : "FAILED"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.cardBottomRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.examTitleLabel}>Exam Module</Text>
                  <Text style={styles.examTitleText} numberOfLines={1}>{res.exam_title}</Text>
                </View>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>Score</Text>
                  <Text style={styles.scoreValue}>
                    {res.score}/{res.total_questions}
                  </Text>
                </View>
              </View>
              <Text style={styles.dateText}>{res.date}</Text>
            </View>
          );
        })}

        {filteredResults.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No exams match the selected filters.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 24 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "900", color: "#0f172a", textTransform: "uppercase", marginBottom: 20 },
  filterLabel: { fontSize: 10, fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 },
  filterTray: { flexDirection: "row", marginBottom: 16 },
  chip: { backgroundColor: "#ffffff", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginRight: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  activeChip: { backgroundColor: "#4f46e5", borderColor: "#4f46e5" },
  chipText: { fontSize: 13, fontWeight: "700", color: "#64748b" },
  activeChipText: { color: "#ffffff" },
  sectionHeader: { fontSize: 11, fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginTop: 12, marginBottom: 14 },
  resultCard: { backgroundColor: "#ffffff", borderRadius: 24, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: "#f1f5f9", elevation: 2, shadowColor: "#0f172a", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6 },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  studentName: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  metaText: { fontSize: 12, fontWeight: "600", color: "#64748b", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  passBadge: { backgroundColor: "#dcfce7" },
  failBadge: { backgroundColor: "#fee2e2" },
  statusBadgeText: { fontSize: 10, fontWeight: "900" },
  passBadgeText: { color: "#16a34a" },
  failBadgeText: { color: "#dc2626" },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 12 },
  cardBottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  examTitleLabel: { fontSize: 9, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" },
  examTitleText: { fontSize: 14, fontWeight: "700", color: "#334155", marginTop: 2 },
  scoreContainer: { alignItems: "flex-end" },
  scoreLabel: { fontSize: 9, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" },
  scoreValue: { fontSize: 15, fontWeight: "900", color: "#4f46e5", marginTop: 2 },
  dateText: { fontSize: 10, fontWeight: "600", color: "#94a3b8", marginTop: 10, alignSelf: "flex-end" },
  emptyCard: { backgroundColor: "#ffffff", padding: 32, borderRadius: 24, alignItems: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  emptyText: { color: "#94a3b8", fontStyle: "italic" },
});