import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView, Image, Platform, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirm_password: '',
    email: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    section: '',
    school_year: '',
    address: '',
    age: '',
    birthday: '',
    profile_picture: null,
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const router = useRouter();

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  // ✅ Pick image from gallery
  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setImagePreview(asset.uri);
      setFormData(prev => ({ ...prev, profile_picture: asset }));
    }
  };

  const handleRegister = async () => {
    setError('');

    // ✅ Validation
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }

    if (
      !formData.section.trim() ||
      !formData.school_year.trim() ||
      formData.section.toLowerCase() === 'n/a' ||
      formData.school_year.toLowerCase() === 'n/a'
    ) {
      setError("Section and School Year cannot be empty or 'N/A'");
      return;
    }

    const requiredFields = [
      'username', 'password', 'email', 'first_name', 'middle_name',
      'last_name', 'address', 'age', 'birthday', 'section', 'school_year'
    ];
    for (let field of requiredFields) {
      if (!formData[field] || !formData[field].toString().trim()) {
        setError('Please fill in all fields.');
        return;
      }
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'confirm_password') return;
        if (key === 'profile_picture' && formData[key]) {
          const asset = formData[key];
          data.append('profile_picture', {
            uri: asset.uri,
            name: 'profile.jpg',
            type: 'image/jpeg',
          });
        } else {
          data.append(key, formData[key]);
        }
      });

      await axios.post('http://192.168.1.42:8000/api/register/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setIsRegistered(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Success screen
  if (isRegistered) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Congratulations!</Text>
          <Text style={styles.successMessage}>
            Welcome aboard, <Text style={styles.successName}>{formData.first_name}</Text>! Your account has been created successfully.
          </Text>
          <View style={styles.successNote}>
            <Text style={styles.successNoteText}>
              Please check your email <Text style={{ textDecorationLine: 'underline' }}>{formData.email}</Text> to activate your account before logging in.
            </Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={() => router.replace('/login')}>
            <Text style={styles.buttonText}>Proceed to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.card}>

        {/* Header */}
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join the examination portal as a student</Text>

        {/* Error */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ACCOUNT SECTION */}
        <Text style={styles.sectionLabel}>Account Registration</Text>

        <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#94a3b8"
          autoCapitalize="none" onChangeText={v => update('username', v)} />

        <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#94a3b8"
          keyboardType="email-address" autoCapitalize="none" onChangeText={v => update('email', v)} />

        {/* NAME SECTION */}
        <Text style={styles.sectionLabel}>Personal Name</Text>

        <TextInput style={styles.input} placeholder="First Name" placeholderTextColor="#94a3b8"
          onChangeText={v => update('first_name', v)} />

        <TextInput style={styles.input} placeholder="Middle Name" placeholderTextColor="#94a3b8"
          onChangeText={v => update('middle_name', v)} />

        <TextInput style={styles.input} placeholder="Last Name" placeholderTextColor="#94a3b8"
          onChangeText={v => update('last_name', v)} />

        {/* PERSONAL DETAILS */}
        <Text style={styles.sectionLabel}>Personal Details</Text>

        <TextInput style={styles.input} placeholder="Full Address" placeholderTextColor="#94a3b8"
          onChangeText={v => update('address', v)} />

        <TextInput style={styles.input} placeholder="Age" placeholderTextColor="#94a3b8"
          keyboardType="numeric" maxLength={2} onChangeText={v => update('age', v)} />

        <TextInput style={styles.input} placeholder="Birthday (YYYY-MM-DD)" placeholderTextColor="#94a3b8"
          onChangeText={v => update('birthday', v)} />

        {/* ACADEMIC */}
        <Text style={styles.sectionLabel}>Academic Info</Text>

        <TextInput style={styles.input} placeholder="Section (e.g. BSIT-4A)" placeholderTextColor="#94a3b8"
          onChangeText={v => update('section', v)} />

        <TextInput style={styles.input} placeholder="School Year (e.g. 2025-2026)" placeholderTextColor="#94a3b8"
          onChangeText={v => update('school_year', v)} />

        {/* PASSWORD */}
        <Text style={styles.sectionLabel}>Password</Text>

        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Create Password"
            placeholderTextColor="#94a3b8"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            onChangeText={v => update('password', v)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Confirm Password"
            placeholderTextColor="#94a3b8"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            onChangeText={v => update('confirm_password', v)}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Text style={styles.eyeText}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        {/* PROFILE PICTURE */}
        <Text style={styles.sectionLabel}>Profile Picture</Text>

        <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
          <Text style={styles.imagePickerText}>📷  Choose Photo</Text>
        </TouchableOpacity>

        {imagePreview && (
          <View style={styles.imagePreviewRow}>
            <Image source={{ uri: imagePreview }} style={styles.imagePreview} />
            <View>
              <Text style={styles.imagePickedTitle}>Photo Selected</Text>
              <Text style={styles.imagePickedSub}>Looking good!</Text>
            </View>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Create Account & Register</Text>
          }
        </TouchableOpacity>

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>Login here</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f1f5f9' },
  container: { padding: 16, paddingBottom: 40, alignItems: 'center' },
  card: {
    width: '100%', maxWidth: 480, backgroundColor: '#fff',
    borderRadius: 20, padding: 24, elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 16,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#0f172a', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 20 },
  sectionLabel: {
    fontSize: 11, fontWeight: '900', color: '#4f46e5',
    textTransform: 'uppercase', letterSpacing: 1,
    borderBottomWidth: 2, borderBottomColor: '#e0e7ff',
    paddingBottom: 4, marginTop: 20, marginBottom: 10,
  },
  input: {
    borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10,
    padding: 12, fontSize: 14, color: '#1e293b',
    backgroundColor: '#f8fafc', marginBottom: 10,
  },
  passwordWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10,
    paddingHorizontal: 12, backgroundColor: '#f8fafc', marginBottom: 10,
  },
  passwordInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#1e293b' },
  eyeText: { fontSize: 18, padding: 4 },
  errorBox: {
    backgroundColor: '#fef2f2', borderColor: '#fecaca',
    borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 14,
  },
  errorText: { color: '#dc2626', fontSize: 13, textAlign: 'center', fontWeight: '600' },
  imagePicker: {
    borderWidth: 2, borderColor: '#c7d2fe', borderStyle: 'dashed',
    borderRadius: 10, padding: 16, alignItems: 'center',
    backgroundColor: '#f5f3ff', marginBottom: 10,
  },
  imagePickerText: { color: '#4f46e5', fontWeight: '700', fontSize: 14 },
  imagePreviewRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#f8fafc', borderRadius: 12, padding: 10,
    marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0',
  },
  imagePreview: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#c7d2fe' },
  imagePickedTitle: { fontWeight: '800', color: '#1e293b', fontSize: 13 },
  imagePickedSub: { color: '#94a3b8', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 },
  button: {
    backgroundColor: '#4f46e5', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center',
    marginTop: 20, elevation: 4,
    shadowColor: '#4f46e5', shadowOpacity: 0.3, shadowRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  loginText: { color: '#64748b', fontSize: 13 },
  loginLink: { color: '#4f46e5', fontWeight: '700', fontSize: 13 },

  // Success screen
  successContainer: { flex: 1, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', padding: 16 },
  successCard: {
    width: '100%', maxWidth: 400, backgroundColor: '#fff',
    borderRadius: 24, padding: 32, alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20,
  },
  successIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#d1fae5', justifyContent: 'center',
    alignItems: 'center', marginBottom: 20,
  },
  successIconText: { fontSize: 36, color: '#059669' },
  successTitle: { fontSize: 28, fontWeight: '900', color: '#0f172a', marginBottom: 12 },
  successMessage: { fontSize: 15, color: '#475569', textAlign: 'center', lineHeight: 22 },
  successName: { color: '#4f46e5', fontWeight: '700' },
  successNote: {
    marginTop: 16, backgroundColor: '#eef2ff', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#c7d2fe',
  },
  successNoteText: { color: '#4338ca', fontSize: 13, textAlign: 'center' },
});
