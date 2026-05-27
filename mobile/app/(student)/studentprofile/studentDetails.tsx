import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity, SafeAreaView } from "react-native"; 
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogOut, User } from "lucide-react-native"; // Synced dashboard-style iconography
import api from "../../../services/api";

interface FullProfile {
  username: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  section?: string;
  school_year?: string;
  address?: string;
  age?: number;
  birthday?: string;
  profile_picture: string | null;
}

export default function StudentProfileDetails() {
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFullDetails = async () => {
      try {
        const token = await AsyncStorage.getItem("auth");
        const res = await api.get("profile/", {
          headers: { Authorization: `Token ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        Alert.alert("Connection Error", "Could not fetch full profile records.");
      } finally {
        setLoading(false);
      }
    };
    fetchFullDetails();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    router.replace("/login");
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL?.replace("/api/", "")}${url}`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7e22ce" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* 🔮 CORE STUDENT PROFILE HEADER PANEL (Synced directly with Admin style) */}
        <View style={styles.headerBlock}>
          <View style={styles.badgeRow}>
            <User size={14} color="#7e22ce" style={styles.headerIcon} />
            <Text style={styles.headerTagline}>System Records</Text>
          </View>
          <Text style={styles.headerTitle}>Account Details</Text>
          <Text style={styles.headerSubtitle}>
            Review your verified credentials, assigned sections, and academic profile.
          </Text>
        </View>

        {/* PROFILE CARD IDENTIFIER */}
        <View style={styles.headerBanner}>
          <View style={styles.avatarLarge}>
            {profile?.profile_picture ? (
              <Image source={{ uri: getImageUrl(profile.profile_picture)! }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.bannerInitials}>
                {profile?.first_name?.charAt(0)}
                {profile?.last_name?.charAt(0)}
              </Text>
            )}
          </View>
          <Text style={styles.fullName}>
            {profile?.first_name} {profile?.middle_name || ""} {profile?.last_name}
          </Text>
          <Text style={styles.usernameText}>@{profile?.username}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Student Account</Text>
          </View>
        </View>

        {/* ACADEMIC FIELDS */}
        <Text style={styles.sectionHeading}>Academic Information</Text>
        <InfoField label="Email Address" value={profile?.email} />
        <InfoField label="Assigned Section" value={profile?.section} />
        <InfoField label="Active School Year" value={profile?.school_year} />

        {/* PERSONAL FIELDS */}
        <Text style={styles.sectionHeading}>Personal Details</Text>
        <InfoField label="Home Address" value={profile?.address} />
        <InfoField label="Age" value={profile?.age ? `${profile?.age} years old` : ""} />
        <InfoField label="Date of Birth" value={profile?.birthday} />

        {/* INTEGRATED SIGN OUT ACTION */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={18} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out Account</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.fieldBox}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || "Not specified"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  scrollContainer: { padding: 16, paddingBottom: 40 }, 
  
  // 🔮 Dashboard Style Synchronization
  headerBlock: {
    backgroundColor: "rgba(243, 232, 255, 0.5)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(126, 34, 206, 0.12)",
    marginBottom: 24,
  },
  badgeRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  headerIcon: { marginRight: 4 },
  headerTagline: { fontSize: 10, fontWeight: "900", color: "#7e22ce", textTransform: "uppercase", letterSpacing: 1.2 },
  headerTitle: { fontSize: 26, fontWeight: "900", color: "#0f172a", textTransform: "uppercase" },
  headerSubtitle: { fontSize: 13, color: "#64748b", marginTop: 4, lineHeight: 18 },
  
  // Profile Content Card Styling
  headerBanner: { backgroundColor: "#2e1065", borderRadius: 24, padding: 24, alignItems: "center", marginBottom: 24 },
  avatarLarge: { width: 96, height: 96, borderRadius: 48, backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 4, borderColor: "#ffffff", justifyContent: "center", alignItems: "center", overflow: "hidden", marginBottom: 14 },
  avatarImg: { width: "100%", height: "100%", resizeMode: "cover" },
  bannerInitials: { fontSize: 28, fontWeight: "900", color: "#ffffff", textTransform: "uppercase" },
  fullName: { fontSize: 20, fontWeight: "900", color: "#ffffff", textAlign: "center" },
  usernameText: { fontSize: 14, color: "#d8b4fe", marginTop: 2, fontWeight: "600" },
  badge: { backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99, marginTop: 12 },
  badgeText: { color: "#ffffff", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  
  // Field Elements Layout
  sectionHeading: { fontSize: 12, fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.2, marginTop: 16, marginBottom: 12, marginLeft: 4 },
  fieldBox: { backgroundColor: "#ffffff", borderRadius: 20, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  fieldLabel: { fontSize: 10, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 },
  fieldValue: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#fef2f2", paddingVertical: 16, borderRadius: 18, gap: 8, borderWidth: 1, borderColor: "#fee2e2", marginTop: 24, marginBottom: 10 },
  logoutText: { color: "#ef4444", fontWeight: "800", fontSize: 14 },
});
