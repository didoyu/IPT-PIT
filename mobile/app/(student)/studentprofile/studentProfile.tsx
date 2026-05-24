import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LogOut, ChevronRight } from "lucide-react-native";
import api from "../../../services/api";

interface ProfileData {
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
}

export default function StudentProfileHub() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfileSummary = async () => {
      try {
        const token = await AsyncStorage.getItem("auth");
        const res = await api.get("profile/", {
          headers: { Authorization: `Token ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to sync profile summary.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfileSummary();
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
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings & Profile</Text>

        {/* CLICKABLE USER ACCOUNT ROW */}
        <TouchableOpacity
          style={styles.profileCard}
          activeOpacity={0.7}
          // 👇 FIXED: Changed path from (admin) to your actual student route folder
          onPress={() => router.push("/(student)/studentprofile/studentDetails")}
        >
          <View style={styles.avatarContainer}>
            {profile?.profile_picture ? (
              <Image source={{ uri: getImageUrl(profile.profile_picture)! }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarInitials}>
                {profile?.first_name?.charAt(0)}
                {profile?.last_name?.charAt(0)}
              </Text>
            )}
          </View>

          <View style={styles.profileMeta}>
            <Text style={styles.profileName} numberOfLines={1}>
              {profile?.first_name} {profile?.last_name}
            </Text>
            <Text style={styles.profileSub}>View and edit full details</Text>
          </View>

          <ChevronRight size={20} color="#94a3b8" />
        </TouchableOpacity>

        <View style={styles.spacer} />

        {/* LOGOUT BUTTON AT THE BOTTOM */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut size={18} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#0f172a", textTransform: "uppercase", marginBottom: 24, marginTop: 16 },
  profileCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#ffffff", padding: 16, borderRadius: 24, borderWidth: 1, borderColor: "#e2e8f0" },
  avatarContainer: { width: 56, height: 56, borderRadius: 99, backgroundColor: "#e0e7ff", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImage: { width: "100%", height: "100%", resizeMode: "cover" },
  avatarInitials: { fontSize: 18, fontWeight: "900", color: "#4f46e5", textTransform: "uppercase" },
  profileMeta: { flex: 1, marginLeft: 16 },
  profileName: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  profileSub: { fontSize: 13, color: "#64748b", marginTop: 2, fontWeight: "500" },
  spacer: { flex: 1 },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#fef2f2", paddingVertical: 16, borderRadius: 18, gap: 8, borderWidth: 1, borderColor: "#fee2e2" },
  logoutText: { color: "#ef4444", fontWeight: "800", fontSize: 14 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" },
});