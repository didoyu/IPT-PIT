import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function ResultsTable() {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [sections, setSections] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);

  const getHeaders = async () => {
    const token = await AsyncStorage.getItem('auth');
    return { Authorization: `Token ${token}` };
  };

  // ✅ Fetch results
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const headers = await getHeaders();
        const res = await axios.get('http://192.168.1.173:8000/api/admin-results/', { headers });
        setResults(res.data);
        setFilteredResults(res.data);
      } catch (err) {
        console.error('Error fetching results', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  // ✅ Generate filter options from results
  useEffect(() => {
    if (!results || results.length === 0) return;

    const uniqueSections = [
      ...new Set(
        results.map(r => r.section).filter(s => s && s.toLowerCase() !== 'n/a')
      )
    ];
    const uniqueYears = [
      ...new Set(
        results.map(r => r.school_year).filter(y => y && y.toLowerCase() !== 'n/a')
      )
    ];

    setSections(uniqueSections);
    setYears(uniqueYears);
  }, [results]);

  // ✅ Filter logic
  useEffect(() => {
    if (!results || results.length === 0) return;

    const filtered = results.filter(r => {
      const matchSection = selectedSection ? r.section?.trim() === selectedSection.trim() : true;
      const matchYear = selectedYear ? r.school_year?.trim() === selectedYear.trim() : true;
      return matchSection && matchYear;
    });

    setFilteredResults(filtered);
  }, [selectedSection, selectedYear, results]);

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color="#4f46e5" />
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Exam Results</Text>

      {/* ✅ Section Filter */}
      <Text style={styles.filterLabel}>Filter by Section:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, selectedSection === '' && styles.filterChipActive]}
          onPress={() => setSelectedSection('')}>
          <Text style={[styles.filterChipText, selectedSection === '' && styles.filterChipTextActive]}>
            All Sections
          </Text>
        </TouchableOpacity>
        {sections.map(sec => (
          <TouchableOpacity
            key={sec}
            style={[styles.filterChip, selectedSection === sec && styles.filterChipActive]}
            onPress={() => setSelectedSection(sec)}>
            <Text style={[styles.filterChipText, selectedSection === sec && styles.filterChipTextActive]}>
              {sec}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ✅ Year Filter */}
      <Text style={styles.filterLabel}>Filter by School Year:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, selectedYear === '' && styles.filterChipActive]}
          onPress={() => setSelectedYear('')}>
          <Text style={[styles.filterChipText, selectedYear === '' && styles.filterChipTextActive]}>
            All Years
          </Text>
        </TouchableOpacity>
        {years.map(yr => (
          <TouchableOpacity
            key={yr}
            style={[styles.filterChip, selectedYear === yr && styles.filterChipActive]}
            onPress={() => setSelectedYear(yr)}>
            <Text style={[styles.filterChipText, selectedYear === yr && styles.filterChipTextActive]}>
              {yr}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ✅ Results Cards */}
      {filteredResults.length === 0 ? (
        <Text style={styles.emptyText}>No exams match the selected filters.</Text>
      ) : (
        filteredResults.map(res => {
          const percentage = (res.score / res.total_questions) * 100;
          const isPassed = percentage >= 50;

          return (
            <View key={res.id} style={styles.resultCard}>

              {/* Student Name + Status */}
              <View style={styles.cardHeader}>
                <Text style={styles.studentName}>{res.student_name}</Text>
                <View style={[styles.statusBadge, isPassed ? styles.passedBadge : styles.failedBadge]}>
                  <Text style={[styles.statusText, isPassed ? styles.passedText : styles.failedText]}>
                    {isPassed ? 'PASSED' : 'FAILED'}
                  </Text>
                </View>
              </View>

              {/* Details */}
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Section</Text>
                <Text style={styles.cardValue}>{res.section}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>School Year</Text>
                <Text style={styles.cardValue}>{res.school_year}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Exam</Text>
                <Text style={styles.cardValue}>{res.exam_title}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Score</Text>
                <Text style={styles.scoreText}>{res.score} / {res.total_questions}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Date</Text>
                <Text style={styles.cardValue}>{res.date}</Text>
              </View>

            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },

  loadingBox: { alignItems: 'center', padding: 32, gap: 10 },
  loadingText: { color: '#94a3b8', fontSize: 14 },

  title: {
    fontSize: 16, fontWeight: '900', color: '#0f172a',
    textTransform: 'uppercase', marginBottom: 16,
  },

  // Filters
  filterLabel: {
    fontSize: 10, fontWeight: '900', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
  filterRow: { marginBottom: 14 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5,
    borderColor: '#e2e8f0', backgroundColor: '#fff',
    marginRight: 8,
  },
  filterChipActive: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
  filterChipText: { fontSize: 12, fontWeight: '700', color: '#64748b' },
  filterChipTextActive: { color: '#4f46e5' },

  // Result card
  resultCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  studentName: { fontSize: 15, fontWeight: '900', color: '#0f172a', flex: 1 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  passedBadge: { backgroundColor: '#dcfce7' },
  failedBadge: { backgroundColor: '#fee2e2' },
  statusText: { fontSize: 10, fontWeight: '900' },
  passedText: { color: '#15803d' },
  failedText: { color: '#b91c1c' },

  cardRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#f8fafc',
  },
  cardLabel: { fontSize: 12, color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' },
  cardValue: { fontSize: 12, color: '#475569', fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  scoreText: { fontSize: 13, fontWeight: '900', color: '#4f46e5' },

  emptyText: { color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: 20 },
});