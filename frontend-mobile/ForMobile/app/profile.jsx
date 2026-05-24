import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, RefreshControl, StatusBar, SafeAreaView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const getHeaders = async () => {
    const token = await AsyncStorage.getItem('auth');
    return { Authorization: `Token ${token}` };
  };

  const fetchData = async () => {
    try {
      const headers = await getHeaders();
      // Fetch profile
      const profileRes = await axios.get('http://192.168.1.42:8000/api/profile/', { headers });
      setProfile(profileRes.data);

      // Fetch student results
      const resultsRes = await axios.get('http://192.168.1.42:8000/api/student-results/', { headers });
      setResults(resultsRes.data);
    } catch (err) {
      console.error('Error fetching student dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['auth', 'user', 'isStaff']);
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  const initials = profile
    ? `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <View style={styles.profileRow}>
            {profile?.profile_picture ? (
              <Image source={{ uri: profile.profile_picture }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>{initials}</Text>
              </View>
            )}
            <View style={styles.headerInfo}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.fullName}>
                {profile?.first_name} {profile?.last_name}
              </Text>
              <Text style={styles.username}>@{profile?.username}</Text>
            </View>
          </View>
        </View>

        {/* STUDENT INFO CARD */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Student Details</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Section</Text>
              <Text style={styles.infoVal}>{profile?.section || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>School Year</Text>
              <Text style={styles.infoVal}>{profile?.school_year || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoVal}>{profile?.email || 'N/A'}</Text>
            </View>
            {profile?.age && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Age</Text>
                <Text style={styles.infoVal}>{profile.age}</Text>
              </View>
            )}
            {profile?.birthday && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Birthday</Text>
                <Text style={styles.infoVal}>{profile.birthday}</Text>
              </View>
            )}
            {profile?.address && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoVal}>{profile.address}</Text>
              </View>
            )}
          </View>
        </View>

        {/* QUICK ACTION: CHATBOT LINK */}
        <TouchableOpacity
          style={styles.chatbotCard}
          onPress={() => router.push('/chatbot')}
        >
          <View style={styles.chatbotCardContent}>
            <View style={styles.chatbotIconContainer}>
              <Text style={styles.chatbotIconText}>💬</Text>
            </View>
            <View style={styles.chatbotTextContainer}>
              <Text style={styles.chatbotCardTitle}>Need Help? Ask AI</Text>
              <Text style={styles.chatbotCardSubtitle}>
                Get instant help with course materials, practice questions, and exam guides.
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* RECENT EXAM RESULTS */}
        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Recent Exam Attempts</Text>
          {results.length === 0 ? (
            <View style={styles.emptyResultsCard}>
              <Text style={styles.emptyResultsText}>No exams attempted yet.</Text>
            </View>
          ) : (
            results.map((res) => (
              <View key={res.id} style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.examTitle} numberOfLines={1}>
                    {res.exam_title}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      res.is_passed ? styles.passBadge : styles.failBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        res.is_passed ? styles.passBadgeText : styles.failBadgeText,
                      ]}
                    >
                      {res.is_passed ? 'PASSED' : 'FAILED'}
                    </Text>
                  </View>
                </View>
                <View style={styles.resultDetails}>
                  <Text style={styles.resultText}>
                    Score:{' '}
                    <Text style={styles.resultScoreHighlight}>
                      {res.score}/{res.total_questions}
                    </Text>{' '}
                    ({Math.round((res.score / (res.total_questions || 1)) * 100)}%)
                  </Text>
                  <Text style={styles.resultDate}>{res.date}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>LOG OUT</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FLOATING ACTION CHATBOT BUTTON */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push('/chatbot')}
      >
        <Text style={styles.floatingButtonText}>💬</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Leave room for floating button
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  header: {
    marginBottom: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarPlaceholderText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  fullName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0f172a',
    marginTop: 2,
  },
  username: {
    fontSize: 13,
    color: '#818cf8',
    fontWeight: '700',
    marginTop: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  infoGrid: {
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
  },
  chatbotCard: {
    backgroundColor: '#eef2ff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#c7d2fe',
    marginBottom: 24,
  },
  chatbotCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  chatbotIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatbotIconText: {
    fontSize: 20,
  },
  chatbotTextContainer: {
    flex: 1,
  },
  chatbotCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#312e81',
  },
  chatbotCardSubtitle: {
    fontSize: 11,
    color: '#4338ca',
    marginTop: 4,
    lineHeight: 15,
    fontWeight: '500',
  },
  resultsContainer: {
    marginBottom: 24,
  },
  emptyResultsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  emptyResultsText: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  examTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e293b',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  passBadge: {
    backgroundColor: '#dcfce7',
  },
  failBadge: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  passBadgeText: {
    color: '#15803d',
  },
  failBadgeText: {
    color: '#b91c1c',
  },
  resultDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  resultScoreHighlight: {
    color: '#0f172a',
    fontWeight: '800',
  },
  resultDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  logoutBtn: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#ef4444',
    fontWeight: '800',
    fontSize: 13,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  floatingButtonText: {
    fontSize: 24,
    color: '#fff',
  },
});
