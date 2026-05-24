import { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Animated
} from 'react-native';
import axios from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ActivateAccount() {
  const { uid, token } = useLocalSearchParams(); // ✅ Expo Router instead of useParams
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const activate = async () => {
      try {
        const response = await axios.get(`http://192.168.1.173:8000/api/activate/${uid}/${token}/`);
        setStatus('success');
        setMessage(response.data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Activation failed. The link may be expired.');
      }
    };
    activate();
  }, [uid, token]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>

        {/* LOADING */}
        {status === 'loading' && (
          <View style={styles.section}>
            <ActivityIndicator size="large" color="#4f46e5" style={styles.spinner} />
            <Text style={styles.heading}>Activating...</Text>
            <Text style={styles.subtext}>Please wait while we verify your account.</Text>
          </View>
        )}

        {/* SUCCESS */}
        {status === 'success' && (
          <View style={styles.section}>
            <Text style={styles.iconSuccess}>✓</Text>
            <Text style={styles.heading}>Success!</Text>
            <Text style={styles.subtext}>{message}</Text>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.replace('/login')}>
              <Text style={styles.primaryBtnText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ERROR */}
        {status === 'error' && (
          <View style={styles.section}>
            <Text style={styles.iconError}>✕</Text>
            <Text style={styles.heading}>Oops!</Text>
            <Text style={styles.subtext}>{message}</Text>
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => router.push('/register')}>
                <Text style={styles.primaryBtnText}>Try Registering Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => router.replace('/login')}>
                <Text style={styles.secondaryBtnText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#f1f5f9',
    justifyContent: 'center', alignItems: 'center', padding: 16,
  },
  card: {
    width: '100%', maxWidth: 400, backgroundColor: '#fff',
    borderRadius: 24, padding: 36,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 5,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  section: { alignItems: 'center' },

  // Loading
  spinner: { marginBottom: 20 },

  // Icons
  iconSuccess: {
    fontSize: 64, color: '#10b981',
    marginBottom: 16, fontWeight: '900',
  },
  iconError: {
    fontSize: 64, color: '#f43f5e',
    marginBottom: 16, fontWeight: '900',
  },

  // Text
  heading: {
    fontSize: 26, fontWeight: '900',
    color: '#0f172a', marginBottom: 10, textAlign: 'center',
  },
  subtext: {
    fontSize: 15, color: '#64748b',
    textAlign: 'center', lineHeight: 22, marginBottom: 28,
  },

  // Buttons
  btnRow: { width: '100%', gap: 12 },
  primaryBtn: {
    backgroundColor: '#4f46e5', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', width: '100%',
    shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  secondaryBtn: {
    backgroundColor: '#e2e8f0', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', width: '100%',
  },
  secondaryBtnText: { color: '#475569', fontWeight: '800', fontSize: 14 },
});