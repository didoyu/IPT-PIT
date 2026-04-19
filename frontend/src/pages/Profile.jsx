import { useEffect, useState } from "react";
import axios from "axios";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Profile");

  const tabs = ["Profile", "Results", "Settings"];

  useEffect(() => {
    const token = localStorage.getItem("auth");
    axios.get("http://127.0.0.1:8000/api/profile/", {
      headers: { Authorization: `Token ${token}` }
    })
    .then(res => setProfile(res.data))
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-500 font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-10 text-center text-red-500 font-semibold">
        Failed to load profile. Please try logging in again.
      </div>
    );
  }

  const initials = `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* SIDEBAR */}
      <aside className="w-56 bg-white border-r border-slate-100 flex flex-col items-center py-10 px-4 gap-6">
        
        {/* Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-indigo-500 flex items-center justify-center text-white text-3xl font-black">
            {initials}
          </div>
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            +
          </div>
        </div>

        {/* Name & username */}
        <div className="text-center">
          <p className="font-black text-slate-800 text-base capitalize">
            {profile.first_name} {profile.last_name}
          </p>
          <p className="text-indigo-500 text-sm font-semibold">@{profile.username}</p>
        </div>

        {/* Tabs */}
        <nav className="w-full flex flex-col gap-1 mt-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-4 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === tab
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 space-y-8">

        {activeTab === "Profile" && (
          <>

            {/* Academic & Account */}
            <section>
              <h3 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">
                Academic & Account
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InfoCard label="Email Address" value={profile.email || "No email provided"} />
                <InfoCard label="Section" value={profile.section} />
                <InfoCard label="School Year" value={profile.school_year} />
              </div>
            </section>

            {/* Personal Info */}
            <section>
              <h3 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InfoCard label="Home Address" value={profile.address || "Not specified"} wide />
                <InfoCard label="Age" value={profile.age ? `${profile.age} years old` : "Not specified"} />
                <InfoCard label="Birthday" value={profile.birthday || "Not specified"} />
              </div>
            </section>
          </>
        )}

        {activeTab === "Results" && (
          <div className="text-slate-400 font-semibold mt-20 text-center">
            Results will appear here.
          </div>
        )}

        {activeTab === "Settings" && (
          <div className="text-slate-400 font-semibold mt-20 text-center">
            Settings coming soon.
          </div>
        )}

      </main>
    </div>
  );
}

// Reusable info card
function InfoCard({ label, value, wide }) {
  return (
    <div className={`bg-white border border-slate-100 p-4 rounded-2xl shadow-sm ${wide ? "md:col-span-2" : ""}`}>
      <p className="text-xs font-bold text-slate-400 uppercase mb-1">{label}</p>
      <p className="text-slate-800 font-semibold">{value}</p>
    </div>
  );
}