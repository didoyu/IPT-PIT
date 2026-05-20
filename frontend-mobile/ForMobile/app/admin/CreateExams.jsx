import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function CreateExam() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passMark, setPassMark] = useState(50);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('auth');
      const res = await axios.post(
        'http://192.168.1.173:8000/api/exams/',
        { title, description, pass_mark: passMark },
        { headers: { Authorization: `Token ${token}` } }
      );
      router.push({ pathname: '/admin/add-question', params: { examId: res.data.id } });
    } catch (err) {
      Alert.alert('Error', 'Error creating exam. Check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Decrease pass mark by 5
  const decrease = () => setPassMark(prev => Math.max(0, prev - 5));

  // ✅ Increase pass mark by 5
  const increase = () => setPassMark(prev => Math.min(100, prev + 5));

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

      {/* ✅ Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/admin/AdminDashboard')}>
        <Text style={styles.backBtnText}>← Back to Dashboard</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Setup New Exam</Text>

        {/* Exam Title */}
        <Text style={styles.label}>Exam Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., CCNA: Subnetting Basics"
          placeholderTextColor="#94a3b8"
          value={title}
          onChangeText={setTitle}
        />

        {/* Instructions */}
        <Text style={styles.label}>Instructions</Text>
        <TextInput
          style={styles.textarea}
          placeholder="Describe what the student needs to know..."
          placeholderTextColor="#94a3b8"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        {/* ✅ Passing Threshold - + - buttons instead of slider */}
        <View style={styles.thresholdCard}>
          <View style={styles.thresholdHeader}>
            <Text style={styles.thresholdLabel}>Passing Threshold</Text>
            <View style={styles.thresholdBadge}>
              <Text style={styles.thresholdBadgeText}>{passMark}%</Text>
            </View>
          </View>

          {/* + / - Controls */}
          <View style={styles.thresholdControls}>
            <TouchableOpacity style={styles.thresholdBtn} onPress={decrease}>
              <Text style={styles.thresholdBtnText}>−</Text>
            </TouchableOpacity>

            {/* Visual bar */}
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${passMark}%` }]} />
            </View>

            <TouchableOpacity style={styles.thresholdBtn} onPress={increase}>
              <Text style={styles.thresholdBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Step chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
            {[0, 25, 50, 60, 75, 80, 90, 100].map(val => (
              <TouchableOpacity
                key={val}
                style={[styles.chip, passMark === val && styles.chipActive]}
                onPress={() => setPassMark(val)}>
                <Text style={[styles.chipText, passMark === val && styles.chipTextActive]}>
                  {val}%
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.thresholdNote}>
            Students must reach this percentage to be marked as "PASSED."
          </Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>CREATE & CONTINUE</Text>
          }
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 16, paddingBottom: 40 },

  // Back button
  backBtn: {
    flexDirection: 'row', alignItems: 'center',
    marginBottom: 16, alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#fff', borderRadius: 10,
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  backBtnText: { color: '#4f46e5', fontWeight: '700', fontSize: 13 },

  // Card
  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
  },
  title: {
    fontSize: 20, fontWeight: '900', color: '#1e293b',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 20,
  },

  // Inputs
  label: {
    fontSize: 10, fontWeight: '900', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8,
  },
  input: {
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14,
    padding: 14, fontSize: 14, color: '#1e293b',
    backgroundColor: '#f8fafc', marginBottom: 18,
  },
  textarea: {
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 14,
    padding: 14, fontSize: 14, color: '#1e293b',
    backgroundColor: '#f8fafc', minHeight: 100, marginBottom: 18,
  },

  // Threshold
  thresholdCard: {
    backgroundColor: '#f8fafc', borderRadius: 16,
    borderWidth: 1, borderColor: '#e2e8f0', padding: 16, marginBottom: 20,
  },
  thresholdHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  thresholdLabel: { fontSize: 13, fontWeight: '800', color: '#334155', textTransform: 'uppercase' },
  thresholdBadge: {
    backgroundColor: '#4f46e5', paddingHorizontal: 12,
    paddingVertical: 4, borderRadius: 20,
  },
  thresholdBadgeText: { color: '#fff', fontWeight: '900', fontSize: 13 },

  // Controls
  thresholdControls: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  thresholdBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#4f46e5', justifyContent: 'center', alignItems: 'center',
  },
  thresholdBtnText: { color: '#fff', fontSize: 20, fontWeight: '900', lineHeight: 22 },

  // Visual bar
  barTrack: {
    flex: 1, height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: '#4f46e5', borderRadius: 4 },

  // Chips
  chipsRow: { marginBottom: 12 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#e2e8f0',
    backgroundColor: '#fff', marginRight: 8,
  },
  chipActive: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  chipTextActive: { color: '#4f46e5' },

  thresholdNote: { fontSize: 10, color: '#94a3b8', fontStyle: 'italic' },

  // Submit
  submitBtn: {
    backgroundColor: '#4f46e5', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
  },
  submitBtnText: { color: '#fff', fontWeight: '900', fontSize: 15, letterSpacing: 1 },
});