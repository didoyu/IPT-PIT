import { useEffect, useState } from "react";
import axios from "axios";
import { User, Shield, Calendar, MapPin, Mail, Layers } from "lucide-react";

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
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setProfile(res.data))
      .catch((err) => {
        console.error("Profile Fetch Error:", err);
        setError("Failed to load profile.");
      })
      .finally(() => setLoading(false));
  }, []);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${API_BASE_URL}${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center text-xs font-black text-purple-600 uppercase tracking-widest animate-pulse">
          Synchronizing User Profile...
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl border border-red-100 text-center shadow-sm">
          <p className="text-red-500 font-black uppercase text-xs tracking-widest mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 min-h-screen bg-slate-50/50">
      
      {/* HEADER */}
      <header className="border-b border-slate-200/60 pb-6">
        <div className="flex items-center gap-1.5 mb-2">
          <User size={14} className="text-purple-600" />
          <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Account Portal</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">My Profile</h1>
      </header>

      {/* PROFILE SUMMARY CARD */}
      <div className="bg-white p-8 rounded-3xl border border-purple-100/40 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="h-24 w-24 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-2xl font-black text-purple-600 uppercase overflow-hidden shadow-inner">
          {profile.profile_picture ? (
            <img src={getImageUrl(profile.profile_picture)} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <>{profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}</>
          )}
        </div>

        <div className="text-center md:text-left">
          <h1 className="text-2xl font-black text-slate-900 uppercase">
            {profile.first_name} {profile.middle_name} {profile.last_name}
          </h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">@{profile.username}</p>
          <span className="inline-block mt-2 bg-purple-50 text-purple-700 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border border-purple-100">
            Student Account
          </span>
        </div>
      </div>

      {/* INFO GRID */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Academic Info */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
             <Layers size={16} className="text-purple-400" />
             <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Academic Data</h2>
          </div>
          <div className="space-y-4">
            <InfoField icon={<Mail size={14}/>} label="Email" value={profile.email} />
            <InfoField icon={<Shield size={14}/>} label="Section" value={profile.section} />
            <InfoField icon={<Calendar size={14}/>} label="School Year" value={profile.school_year} />
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
             <User size={16} className="text-purple-400" />
             <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest">Personal Details</h2>
          </div>
          <div className="space-y-4">
            <InfoField icon={<MapPin size={14}/>} label="Address" value={profile.address} />
            <InfoField label="Age" value={profile.age ? `${profile.age} years old` : ""} />
            <InfoField label="Birthday" value={profile.birthday} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value, icon }) {
  return (
    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
      <div className="flex items-center gap-2 mb-1.5">
        {icon && <div className="text-slate-400">{icon}</div>}
        <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">{label}</p>
      </div>
      <p className="text-slate-800 font-bold text-sm">{value || "Not specified"}</p>
    </div>
  );
}