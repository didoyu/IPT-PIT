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
import { Award } from "lucide-react-native";
import api from "../../services/api";

interface ExamRecord {
  id: number;
  student_name: string;
  section: string;
  school_year: string;
  exam_title: string;
  score: number;
  total_questions: number;
  passed: boolean;
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
        <ActivityIndicator size="large" color="#7e22ce" />
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.headerBlock}>
          <Text style={styles.headerTagline}>Student Data</Text>
          <Text style={styles.title}>Results</Text>
          <Text style={styles.headerSubtitle}>
            Real-time scores and passing status of all exam attempts.
          </Text>
        </View>

        {/* FILTER — SECTION */}
        <Text style={styles.filterLabel}>Filter By Section</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterTray}
        >
          <TouchableOpacity
            style={[styles.chip, selectedSection === "" && styles.activeChip]}
            onPress={() => setSelectedSection("")}
          >
            <Text
              style={[
                styles.chipText,
                selectedSection === "" && styles.activeChipText,
              ]}
            >
              All Sections
            </Text>
          </TouchableOpacity>
          {sections.map((sec) => (
            <TouchableOpacity
              key={sec}
              style={[
                styles.chip,
                selectedSection === sec && styles.activeChip,
              ]}
              onPress={() => setSelectedSection(sec)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedSection === sec && styles.activeChipText,
                ]}
              >
                {sec}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* FILTER — YEAR */}
        <Text style={styles.filterLabel}>Filter By School Year</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterTray}
        >
          <TouchableOpacity
            style={[styles.chip, selectedYear === "" && styles.activeChip]}
            onPress={() => setSelectedYear("")}
          >
            <Text
              style={[
                styles.chipText,
                selectedYear === "" && styles.activeChipText,
              ]}
            >
              All Years
            </Text>
          </TouchableOpacity>
          {years.map((yr) => (
            <TouchableOpacity
              key={yr}
              style={[styles.chip, selectedYear === yr && styles.activeChip]}
              onPress={() => setSelectedYear(yr)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedYear === yr && styles.activeChipText,
                ]}
              >
                {yr}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* RECORDS COUNT */}
        <Text style={styles.sectionHeader}>
          Records ({filteredResults.length})
        </Text>

        {/* RESULT CARDS */}
        {filteredResults.map((res) => {
          // Trust server-computed passed field — consistent with web
          const isPassed = res.passed;

          return (
            <View key={res.id} style={styles.resultCard}>
              {/* Accent strip matching web card style */}
              <View style={styles.cardAccentStrip} />

              <View style={styles.cardTopRow}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.studentName}>{res.student_name}</Text>
                  <Text style={styles.metaText}>
                    Section {res.section} • {res.school_year}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    isPassed ? styles.passBadge : styles.failBadge,
                  ]}
                >
                  {isPassed && (
                    <Award
                      size={10}
                      color="#16a34a"
                      style={{ marginRight: 4 }}
                    />
                  )}
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isPassed ? styles.passBadgeText : styles.failBadgeText,
                    ]}
                  >
                    {isPassed ? "PASSED" : "FAILED"}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.cardBottomRow}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.examTitleLabel}>Exam Module</Text>
                  <Text style={styles.examTitleText} numberOfLines={1}>
                    {res.exam_title}
                  </Text>
                </View>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>Score</Text>
                  <Text style={styles.scoreValue}>
                    {res.score}
                    <Text style={styles.scoreDivider}>/</Text>
                    {res.total_questions}
                  </Text>
                </View>
              </View>

              <Text style={styles.dateText}>{res.date}</Text>
            </View>
          );
        })}

        {filteredResults.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              No active exam result sequences match the selected filters.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContent: { padding: 16, paddingBottom: 40 },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: "700",
    color: "#9333ea",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Header — matches AdminDashboard header style
  headerBlock: {
    backgroundColor: "rgba(243, 232, 255, 0.5)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(126, 34, 206, 0.12)",
    marginBottom: 24,
  },
  headerTagline: {
    fontSize: 10,
    fontWeight: "900",
    color: "#7e22ce",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0f172a",
    textTransform: "uppercase",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 18,
  },

  // Filters
  filterLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  filterTray: { flexDirection: "row", marginBottom: 16 },
  chip: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  activeChip: { backgroundColor: "#7e22ce", borderColor: "#7e22ce" },
  chipText: { fontSize: 13, fontWeight: "700", color: "#64748b" },
  activeChipText: { color: "#ffffff" },

  sectionHeader: {
    fontSize: 11,
    fontWeight: "900",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 4,
    marginBottom: 14,
  },

  // Result Cards
  resultCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(126, 34, 206, 0.12)",
    elevation: 1,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    position: "relative",
    overflow: "hidden",
  },
  // Top accent strip — mirrors web card & admin exam card style
  cardAccentStrip: {
    position: "absolute",
    top: 0,
    left: 20,
    width: 36,
    height: 3.5,
    backgroundColor: "#7e22ce",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },

  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  studentName: { fontSize: 16, fontWeight: "800", color: "#0f172a" },
  metaText: { fontSize: 12, fontWeight: "600", color: "#64748b", marginTop: 2 },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    borderWidth: 1,
  },
  passBadge: { backgroundColor: "#f0fdf4", borderColor: "rgba(22,163,74,0.2)" },
  failBadge: { backgroundColor: "#fef2f2", borderColor: "rgba(220,38,38,0.2)" },
  statusBadgeText: { fontSize: 10, fontWeight: "900" },
  passBadgeText: { color: "#16a34a" },
  failBadgeText: { color: "#dc2626" },

  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 12,
  },

  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  examTitleLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  examTitleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginTop: 2,
  },

  scoreContainer: { alignItems: "flex-end" },
  scoreLabel: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  scoreValue: {
    fontSize: 15,
    fontWeight: "900",
    color: "#7e22ce",
    marginTop: 2,
  },
  scoreDivider: { color: "#cbd5e1", fontWeight: "400", fontSize: 12 },

  dateText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#94a3b8",
    marginTop: 10,
    alignSelf: "flex-end",
  },

  emptyCard: {
    backgroundColor: "#ffffff",
    padding: 32,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  emptyText: {
    color: "#94a3b8",
    fontStyle: "italic",
    fontSize: 13,
    textAlign: "center",
  },
});
