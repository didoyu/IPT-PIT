import { useEffect, useState } from "react";
import axios from "axios";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth");

    axios.get("http://127.0.0.1:8000/api/profile/", {
      headers: {
        Authorization: `Token ${token}`
      }
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

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10 bg-slate-50 min-h-screen">

      {/* HEADER */}
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
          My Profile
        </h1>
        <p className="text-slate-500 font-medium">
          View your personal and account information
        </p>
      </header>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 space-y-8">

        {/* TOP SECTION */}
        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800 capitalize">
              {profile.first_name} {profile.middle_name} {profile.last_name}
            </h2>
            <p className="text-indigo-500 font-bold">
              @{profile.username}
            </p>
          </div>

          <div className="bg-indigo-100 text-indigo-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider">
            Student Account
          </div>
        </div>

        {/* ACCOUNT DETAILS */}
        <div>
          <h3 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">Academic & Account</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase">Email Address</p>
              <p className="text-slate-800 font-semibold">{profile.email || "No email provided"}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase">Section</p>
              <p className="text-slate-800 font-semibold">{profile.section}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase">School Year</p>
              <p className="text-slate-800 font-semibold">{profile.school_year}</p>
            </div>
          </div>
        </div>

        {/* PERSONAL DETAILS SECTION */}
        <div>
          <h3 className="text-xs font-black uppercase text-slate-400 mb-4 tracking-widest">Personal Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            
            <div className="bg-slate-50 p-4 rounded-2xl md:col-span-2">
              <p className="text-xs font-bold text-slate-400 uppercase">Home Address</p>
              <p className="text-slate-800 font-semibold">{profile.address || "Not specified"}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase">Age</p>
              <p className="text-slate-800 font-semibold">{profile.age ? `${profile.age} years old` : "Not specified"}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl">
              <p className="text-xs font-bold text-slate-400 uppercase">Birthday</p>
              <p className="text-slate-800 font-semibold">{profile.birthday || "Not specified"}</p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}