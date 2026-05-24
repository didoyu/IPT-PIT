import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, Image, ActivityIndicator, Alert, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${api.defaults.baseURL?.replace("/api/", "")}${url}`;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* HEADER GRADIENT REPLICA */}
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
          
          {/* 👇 FIXED: Changed Badge from Administrator Account to Student Account */}
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
  scrollContainer: { padding: 20, paddingBottom: 40 },
  headerBanner: { backgroundColor: "#4f46e5", borderRadius: 32, padding: 24, alignItems: "center", marginBottom: 24 },
  avatarLarge: { width: 96, height: 96, borderRadius: 48, backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 4, borderColor: "#ffffff", justifyContent: "center", alignItems: "center", overflow: "hidden", marginBottom: 14 },
  avatarImg: { width: "100%", height: "100%", resizeMode: "cover" },
  bannerInitials: { fontSize: 28, fontWeight: "900", color: "#ffffff", textTransform: "uppercase" },
  fullName: { fontSize: 20, fontWeight: "900", color: "#ffffff", textAlign: "center" },
  usernameText: { fontSize: 14, color: "#c7d2fe", marginTop: 2, fontWeight: "600" },
  badge: { backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99, marginTop: 12 },
  badgeText: { color: "#ffffff", fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  sectionHeading: { fontSize: 12, fontWeight: "900", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.2, marginTop: 16, marginBottom: 12, marginLeft: 4 },
  fieldBox: { backgroundColor: "#ffffff", borderRadius: 20, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  fieldLabel: { fontSize: 10, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", marginBottom: 4 },
  fieldValue: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
});