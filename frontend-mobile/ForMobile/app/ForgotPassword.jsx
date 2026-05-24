import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function ForgotPassword() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Request Code, 2: Reset Password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    code: new Array(6).fill(''),
    newPassword: '',
    confirmPassword: '',
  });

  // ✅ Refs for OTP inputs
  const inputRefs = useRef([]);

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleCodeChange = (digit, index) => {
    if (isNaN(digit)) return;
    const newCode = [...formData.code];
    newCode[index] = digit;
    setFormData(prev => ({ ...prev, code: newCode }));
    if (digit !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeBackspace = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !formData.code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleRequestCode = async () => {
    setLoading(true);
    setError('');
    try {
      await axios.post('http://192.168.1.173:8000/api/forgot-password/', {
        username: formData.username,
        email: formData.email,
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.post('http://192.168.1.173:8000/api/reset-password/', {
        username: formData.username,
        code: formData.code.join(''),
        new_password: formData.newPassword,
      });
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => router.replace('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code or request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post('http://192.168.1.173:8000/api/resend-password-reset/', {
        username: formData.username,
        email: formData.email,
      });
      setSuccess('A new reset code has been sent!');
      setFormData(prev => ({ ...prev, code: new Array(6).fill('') }));
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <View style={styles.card}>

          {/* Header */}
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>🔑</Text>
          </View>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? 'Enter your details to receive a reset code.'
              : 'Enter the code and your new password.'}
          </Text>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>• {error}</Text>
            </View>
          ) : null}

          {/* Success */}
          {success ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>✓ {success}</Text>
            </View>
          ) : null}

          {/* ── STEP 1: Request Code ── */}
          {step === 1 && (
            <View style={styles.form}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Your username"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                value={formData.username}
                onChangeText={v => update('username', v)}
              />

              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Your registered email"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={v => update('email', v)}
              />

              <TouchableOpacity
                style={[styles.primaryBtn, loading && { opacity: 0.6 }]}
                onPress={handleRequestCode}
                disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.primaryBtnText}>Send Reset Code →</Text>
                }
              </TouchableOpacity>
            </View>
          )}

          {/* ── STEP 2: Reset Password ── */}
          {step === 2 && (
            <View style={styles.form}>

              {/* OTP Code Inputs */}
              <Text style={styles.label}>Reset Code</Text>
              <View style={styles.otpRow}>
                {formData.code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={el => (inputRefs.current[index] = el)}
                    style={[styles.otpInput, digit && styles.otpInputFilled]}
                    maxLength={1}
                    keyboardType="numeric"
                    value={digit}
                    onChangeText={v => handleCodeChange(v, index)}
                    onKeyPress={e => handleCodeBackspace(e, index)}
                    textAlign="center"
                  />
                ))}
              </View>

              {/* New Password */}
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Minimum 8 characters"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={formData.newPassword}
                  onChangeText={v => update('newPassword', v)}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Repeat new password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  value={formData.confirmPassword}
                  onChangeText={v => update('confirmPassword', v)}
                />
              </View>

              {/* Reset Button */}
              <TouchableOpacity
                style={[styles.darkBtn, loading && { opacity: 0.6 }]}
                onPress={handleResetPassword}
                disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.darkBtnText}>Reset Password</Text>
                }
              </TouchableOpacity>

              {/* Resend Button */}
              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleResend}
                disabled={loading}>
                <Text style={styles.resendBtnText}>🔄 Resend Code</Text>
              </TouchableOpacity>

            </View>
          )}

          {/* Back to Login */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={() => router.replace('/login')}>
              <Text style={styles.footerLink}>Back to Login</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f8fafc' },
  container: { padding: 16, paddingBottom: 40, justifyContent: 'center', alignItems: 'center' },

  card: {
    width: '100%', maxWidth: 420, backgroundColor: '#fff',
    borderRadius: 28, padding: 28,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20, elevation: 5,
    borderWidth: 1, borderColor: '#f1f5f9',
  },

  // Header
  iconBox: {
    width: 64, height: 64, backgroundColor: '#eef2ff',
    borderRadius: 18, justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: 16,
  },
  iconText: { fontSize: 30 },
  title: {
    fontSize: 22, fontWeight: '900', color: '#0f172a',
    textAlign: 'center', marginBottom: 6,
  },
  subtitle: {
    fontSize: 13, color: '#64748b', textAlign: 'center',
    fontWeight: '500', marginBottom: 20,
  },

  // Alerts
  errorBox: {
    backgroundColor: '#fff1f2', borderWidth: 1, borderColor: '#fecdd3',
    borderRadius: 14, padding: 12, marginBottom: 16,
  },
  errorText: { color: '#e11d48', fontWeight: '700', fontSize: 13 },
  successBox: {
    backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0',
    borderRadius: 14, padding: 12, marginBottom: 16,
  },
  successText: { color: '#16a34a', fontWeight: '700', fontSize: 13 },

  // Form
  form: { gap: 4 },
  label: {
    fontSize: 10, fontWeight: '900', color: '#94a3b8',
    textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: 6, marginTop: 12,
  },
  input: {
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 14, fontWeight: '600', color: '#1e293b',
    backgroundColor: '#f8fafc',
  },

  // Password
  passwordWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16,
    paddingHorizontal: 16, backgroundColor: '#f8fafc', marginBottom: 4,
  },
  passwordInput: { flex: 1, paddingVertical: 14, fontSize: 14, fontWeight: '600', color: '#1e293b' },
  eyeText: { fontSize: 18, padding: 4 },

  // OTP
  otpRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    gap: 8, marginBottom: 16,
  },
  otpInput: {
    flex: 1, height: 52, borderWidth: 1.5, borderColor: '#e2e8f0',
    borderRadius: 14, fontSize: 22, fontWeight: '900',
    color: '#1e293b', backgroundColor: '#f8fafc', textAlign: 'center',
  },
  otpInputFilled: { borderColor: '#4f46e5', backgroundColor: '#eef2ff' },

  // Buttons
  primaryBtn: {
    backgroundColor: '#4f46e5', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', marginTop: 16,
    shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  primaryBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },

  darkBtn: {
    backgroundColor: '#0f172a', borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', marginTop: 16,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
  },
  darkBtnText: { color: '#fff', fontWeight: '900', fontSize: 15 },

  resendBtn: {
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  resendBtnText: { color: '#64748b', fontWeight: '700', fontSize: 13 },

  // Footer
  footer: {
    marginTop: 24, paddingTop: 20,
    borderTopWidth: 1, borderTopColor: '#f1f5f9',
    alignItems: 'center',
  },
  footerLink: { color: '#4f46e5', fontWeight: '700', fontSize: 14 },
});