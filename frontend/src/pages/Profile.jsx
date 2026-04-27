import { useEffect, useState } from "react";
import axios from "axios";

// 1. Define your backend base URL for relative paths
const API_BASE_URL = "http://127.0.0.1:8000";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("auth");

    if (!token) {
      setError("No access token found. Please log in.");
      setLoading(false);
      return;
    }

    axios
      .get(`${API_BASE_URL}/api/profile/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((res) => {
        console.log("Profile Data:", res.data); // Debugging: check the URL format here
        setProfile(res.data);
      })
      .catch((err) => {
        console.error("Profile Fetch Error:", err.response?.data || err);
        setError("Failed to load profile.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Helper to get the correct Image Source
  const getImageUrl = (url) => {
    if (!url) return null;
    // If it's already a full URL (Cloudinary), return as is
    if (url.startsWith("http")) return url;
    // If it's a relative path, prepend the backend host
    return `${API_BASE_URL}${url}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-500 font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center border border-red-100">
          <p className="text-red-500 font-bold mb-4">{error || "Something went wrong."}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-3xl shadow-xl p-8 text-white mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-28 w-28 rounded-full bg-white/20 border-4 border-white flex items-center justify-center text-3xl font-black uppercase overflow-hidden">
              {/* FIXED IMAGE SRC LOGIC */}
              {profile.profile_picture ? (
                <img
                  src={getImageUrl(profile.profile_picture)}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  {profile.first_name?.charAt(0)}
                  {profile.last_name?.charAt(0)}
                </>
              )}
            </div>

            <div className="text-center md:text-left">
              <h1 className="text-3xl font-black">
                {profile.first_name} {profile.middle_name} {profile.last_name}
              </h1>
              <p className="text-indigo-100 text-lg">@{profile.username}</p>
              <span className="inline-block mt-3 bg-white/20 px-4 py-1 rounded-full text-sm font-semibold">
                Student Account
              </span>
            </div>
          </div>
        </div>

        {/* Academic & Personal Information cards remain the same... */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-100">
            <h2 className="text-lg font-black text-slate-800 mb-5">Academic Information</h2>
            <div className="space-y-4">
              <InfoField label="Email" value={profile.email} />
              <InfoField label="Section" value={profile.section} />
              <InfoField label="School Year" value={profile.school_year} />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-100">
            <h2 className="text-lg font-black text-slate-800 mb-5">Personal Information</h2>
            <div className="space-y-4">
              <InfoField label="Address" value={profile.address} />
              <InfoField label="Age" value={profile.age ? `${profile.age} years old` : ""} />
              <InfoField label="Birthday" value={profile.birthday} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
      <p className="text-xs uppercase font-bold text-slate-400 mb-1">{label}</p>
      <p className="text-slate-800 font-semibold">{value || "Not specified"}</p>
    </div>
  );
}