import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Camera, Edit2, Check, X, Mail, ShieldCheck } from "lucide-react";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Email Verification State
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [emailStatus, setEmailStatus] = useState(""); // "", "sending", "sent", "verifying"
  
  const fileInputRef = useRef(null);
  const tabs = ["Profile", "Results", "Settings"];

  const fetchProfile = () => {
    const token = localStorage.getItem("auth");
    axios.get("http://127.0.0.1:8000/api/profile/", {
      headers: { Authorization: `Token ${token}` }
    })
    .then(res => {
      setProfile(res.data);
      setEditData(res.data);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("auth");
    const formData = new FormData();
    
    if (editData.username !== profile.username) formData.append("username", editData.username);
    if (editData.section !== profile.section) formData.append("section", editData.section);
    if (editData.address !== profile.address) formData.append("address", editData.address);
    if (newImage) formData.append("profile_picture", newImage);

    try {
      await axios.post("http://127.0.0.1:8000/api/profile/update/", formData, {
        headers: { 
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setIsEditing(false);
      fetchProfile();
      setNewImage(null);
      setImagePreview(null);
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update profile");
    }
  };

  const handleRequestEmailCode = async () => {
    if (!editData.email || editData.email === profile.email) return;
    
    setEmailStatus("sending");
    const token = localStorage.getItem("auth");
    try {
      await axios.post("http://127.0.0.1:8000/api/profile/request-email-change/", 
        { new_email: editData.email },
        { headers: { Authorization: `Token ${token}` } }
      );
      setEmailStatus("sent");
      setIsVerifyingEmail(true);
    } catch (err) {
      setEmailStatus("");
      alert(err.response?.data?.error || "Failed to send code");
    }
  };

  const handleVerifyEmail = async () => {
    const token = localStorage.getItem("auth");
    try {
      await axios.post("http://127.0.0.1:8000/api/profile/verify-email-change/", 
        { code: verificationCode },
        { headers: { Authorization: `Token ${token}` } }
      );
      setIsVerifyingEmail(false);
      setEmailStatus("");
      setVerificationCode("");
      fetchProfile();
      alert("Email updated successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Invalid code");
    }
  };

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

  if (!profile) return <div className="p-10 text-center text-red-500">Failed to load profile.</div>;

  const initials = `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col items-center py-10 px-6 gap-8">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-indigo-500 flex items-center justify-center">
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
            ) : profile.profile_picture ? (
              <img src={profile.profile_picture} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <span className="text-white text-4xl font-black">{initials}</span>
            )}
          </div>
          {isEditing && (
            <button 
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition"
            >
              <Camera size={18} />
            </button>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
        </div>

        <div className="text-center w-full">
          {isEditing ? (
            <div className="space-y-2">
              <input 
                className="w-full text-center font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg py-1"
                value={editData.username}
                onChange={e => setEditData({...editData, username: e.target.value})}
              />
              <p className="text-indigo-500 text-sm font-semibold">@{profile.username}</p>
            </div>
          ) : (
            <>
              <p className="font-black text-slate-800 text-xl capitalize">{profile.first_name} {profile.last_name}</p>
              <p className="text-indigo-500 text-sm font-semibold">@{profile.username}</p>
            </>
          )}
        </div>

        <nav className="w-full flex flex-col gap-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-left px-4 py-3 rounded-xl text-sm font-bold transition flex items-center gap-3 ${
                activeTab === tab ? "bg-indigo-50 text-indigo-700" : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Student Profile</h1>
            <p className="text-slate-500 font-medium">Manage your personal and academic information</p>
          </div>
          
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button 
                  onClick={() => { setIsEditing(false); setEditData(profile); setImagePreview(null); setNewImage(null); }}
                  className="px-5 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition flex items-center gap-2"
                >
                  <X size={18} /> Cancel
                </button>
                <button 
                  onClick={handleSaveProfile}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center gap-2"
                >
                  <Check size={18} /> Save Changes
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 rounded-xl bg-white border-2 border-slate-100 text-slate-700 font-bold hover:border-indigo-100 hover:bg-indigo-50/30 transition flex items-center gap-2 shadow-sm"
              >
                <Edit2 size={18} className="text-indigo-600" /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {activeTab === "Profile" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Account Info */}
            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-xs font-black uppercase text-indigo-600 mb-6 tracking-widest flex items-center gap-2">
                <ShieldCheck size={16} /> Account Information
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
                  <div className="flex gap-2">
                    <input 
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-xl border transition ${isEditing ? "bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" : "bg-transparent border-transparent text-slate-800 font-semibold"}`}
                      value={editData.email}
                      onChange={e => setEditData({...editData, email: e.target.value})}
                    />
                    {isEditing && editData.email !== profile.email && !isVerifyingEmail && (
                      <button 
                        onClick={handleRequestEmailCode}
                        disabled={emailStatus === "sending"}
                        className="bg-indigo-600 text-white px-4 rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {emailStatus === "sending" ? "Sending..." : "Verify"}
                      </button>
                    )}
                  </div>
                  
                  {isVerifyingEmail && (
                    <div className="mt-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
                      <p className="text-sm font-bold text-indigo-700 flex items-center gap-2">
                        <Mail size={16} /> Enter verification code sent to {editData.email}
                      </p>
                      <div className="flex gap-2">
                        <input 
                          placeholder="6-digit code"
                          className="w-full px-4 py-2 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold tracking-widest"
                          value={verificationCode}
                          onChange={e => setVerificationCode(e.target.value.slice(0, 6))}
                        />
                        <button 
                          onClick={handleVerifyEmail}
                          className="bg-indigo-600 text-white px-6 rounded-xl font-bold"
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <InfoCard 
                  label="Section" 
                  value={editData.section} 
                  isEditing={isEditing}
                  onChange={val => setEditData({...editData, section: val})}
                />
                <div className="md:col-span-2">
                  <InfoCard 
                    label="Home Address" 
                    value={editData.address} 
                    isEditing={isEditing}
                    onChange={val => setEditData({...editData, address: val})}
                    wide 
                  />
                </div>
              </div>
            </section>

            {/* Static Personal Details */}
            <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm opacity-80">
              <h3 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-widest">Personal Details (Contact Admin to change)</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <InfoCard label="Full Name" value={`${profile.first_name} ${profile.last_name}`} />
                <InfoCard label="Age" value={profile.age ? `${profile.age} years old` : "N/A"} />
                <InfoCard label="Birthday" value={profile.birthday || "N/A"} />
              </div>
            </section>
          </div>
        )}

        {activeTab === "Results" && <div className="p-20 text-center text-slate-400 font-bold">Results feature coming soon...</div>}
        {activeTab === "Settings" && <div className="p-20 text-center text-slate-400 font-bold">Settings feature coming soon...</div>}
      </main>
    </div>
  );
}

function InfoCard({ label, value, isEditing, onChange, wide }) {
  return (
    <div className={`space-y-2 ${wide ? "md:col-span-2" : ""}`}>
      <label className="text-xs font-bold text-slate-400 uppercase ml-1">{label}</label>
      <div className={`w-full px-4 py-3 rounded-xl border transition ${isEditing ? "bg-slate-50 border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" : "bg-transparent border-transparent text-slate-800 font-semibold"}`}>
        {isEditing ? (
          <input 
            className="bg-transparent w-full outline-none"
            value={value || ""}
            onChange={e => onChange(e.target.value)}
          />
        ) : (
          <p>{value || "Not specified"}</p>
        )}
      </div>
    </div>
  );
}