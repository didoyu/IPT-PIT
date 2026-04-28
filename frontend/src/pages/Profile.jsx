import { useEffect, useState, useRef } from "react";
import axios from "axios";

import { Camera, Edit2, Check, X, Mail, ShieldCheck } from "lucide-react";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Profile");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const editImageRef = useRef(null);


  const tabs = ["Profile", "Results"];

  // ✅ Missing State Declarations
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [emailStatus, setEmailStatus] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);



  const fetchProfile = () => {
    const token = localStorage.getItem("auth");
    if (!token) {
      setLoading(false);
      return;
    }
    axios.get("http://127.0.0.1:8000/api/profile/", {
      headers: { Authorization: `Token ${token}` }
    })
    .then(res => {
      const data = { ...res.data, avatar: res.data.profile_picture };
      setProfile(data);
      setEditData(data);
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
    console.log("Save Profile Clicked");
    const token = localStorage.getItem("auth");
    const formData = new FormData();
    
    // ✅ Include all fields
    formData.append("first_name", editData.first_name || "");
    formData.append("middle_name", editData.middle_name || "");
    formData.append("last_name", editData.last_name || "");
    formData.append("section", editData.section || "");
    formData.append("school_year", editData.school_year || "");
    formData.append("address", editData.address || "");
    formData.append("age", editData.age || "");
    formData.append("birthday", editData.birthday || "");
    
    if (newImage) {
      formData.append("profile_picture", newImage);
    }

    try {
      console.log("Sending Profile Update Request...", Object.fromEntries(formData));
      await axios.post("http://127.0.0.1:8000/api/profile/update/", formData, {
        headers: { 
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      console.log("Update Successful!");
      setShowSuccess(true);
      setIsEditing(false);
      fetchProfile();
      setNewImage(null);
      setImagePreview(null);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error("Update Failed:", err);
      alert(err.response?.data?.error || "Failed to update profile. Check console for details.");
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
      <aside className="w-56 bg-white border-r border-slate-100 flex flex-col items-center py-10 px-4 gap-6">

        {/* AVATAR */}
        <div
          className="relative group cursor-pointer"
          style={{ width: '96px', height: '96px' }}
          onClick={() => {
            if (!isEditing) setIsEditing(true);
            setTimeout(() => editImageRef.current.click(), 100);
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
          />


          {imagePreview || profile.avatar ? (
            <img
              src={imagePreview || profile.avatar}
              alt="avatar"
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
              }}
            />
          ) : (
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              backgroundColor: '#6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '28px',
              fontWeight: '900'
            }}>
              {initials}
            </div>
          )}


          {/* Hover overlay */}
          <div
            className="absolute inset-0 group-hover:bg-black group-hover:bg-opacity-40 transition-all flex items-center justify-center"
            style={{ borderRadius: '50%' }}
          >
            <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-all">
              {uploading ? "Uploading..." : "Change"}
            </span>
          </div>

          {/* Plus button */}
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
            +
          </div>
          {isEditing && (
            <button 
              type="button"
              onClick={() => editImageRef.current.click()}
              className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition z-20"
            >
              <Camera size={18} />
            </button>
          )}
          <input type="file" ref={editImageRef} className="hidden" accept="image/*" onChange={handleImageChange} />

        </div>

        {/* NAME */}
        <div className="text-center">
          <p className="font-black text-slate-800 text-base capitalize">
            {profile.first_name} {profile.last_name}
          </p>
          <p className="text-indigo-500 text-sm font-semibold">@{profile.username}</p>
        </div>

        {/* TABS */}
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
        {/* SUCCESS MESSAGE POPUP */}
        {showSuccess && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-emerald-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border-2 border-emerald-400">
              <ShieldCheck size={24} />
              <p className="font-black text-lg">Changes Saved Successfully!</p>
            </div>
          </div>
        )}

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
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 flex items-center gap-2 cursor-pointer z-10"
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
          <>
            <section className="space-y-8">
              {/* ACADEMIC & ACCOUNT */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-xs font-black uppercase text-slate-400 mb-2 tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                  Academic & Account
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
                    <div className="flex gap-2">
                      <div className={`w-full px-4 py-3 rounded-2xl border transition flex items-center bg-slate-50/50 border-slate-100 ${isEditing ? "focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white" : ""}`}>
                        <input 
                          disabled={!isEditing}
                          className="w-full bg-transparent outline-none text-slate-800 font-semibold"
                          value={isEditing ? editData.email : profile.email}
                          onChange={e => setEditData({...editData, email: e.target.value})}
                        />
                      </div>
                      {isEditing && editData.email !== profile.email && !isVerifyingEmail && (
                        <button 
                          onClick={handleRequestEmailCode}
                          disabled={emailStatus === "sending"}
                          className="bg-indigo-600 text-white px-4 rounded-2xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition shadow-lg shadow-indigo-100"
                        >
                          {emailStatus === "sending" ? "..." : "Verify"}
                        </button>
                      )}
                    </div>
                    
                    {isVerifyingEmail && (
                      <div className="mt-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
                        <p className="text-sm font-bold text-indigo-700 flex items-center gap-2">
                          <Mail size={16} /> Enter code sent to {editData.email}
                        </p>
                        <div className="flex gap-2">
                          <input 
                            placeholder="000000"
                            className="w-full px-4 py-2 rounded-xl border border-indigo-200 focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold tracking-widest bg-white"
                            value={verificationCode}
                            onChange={e => setVerificationCode(e.target.value.slice(0, 6))}
                          />
                          <button 
                            onClick={handleVerifyEmail}
                            className="bg-indigo-600 text-white px-6 rounded-xl font-bold hover:bg-indigo-700 transition"
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <InfoCard 
                    label="Section" 
                    value={isEditing ? editData.section : profile.section} 
                    isEditing={isEditing}
                    onChange={val => setEditData({...editData, section: val})}
                  />
                  
                  <InfoCard 
                    label="School Year" 
                    type="select"
                    options={Array.from({ length: 2026 - 1980 }, (_, i) => {
                      const year = 1980 + i;
                      return `${year}-${year + 1}`;
                    })}
                    value={isEditing ? editData.school_year : profile.school_year} 
                    isEditing={isEditing}
                    onChange={val => setEditData({...editData, school_year: val})}
                  />

                </div>
              </div>

              {/* PERSONAL INFORMATION */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-xs font-black uppercase text-slate-400 mb-2 tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
                  Personal Information
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="md:col-span-2 lg:col-span-3">
                    <InfoCard 
                      label="Home Address" 
                      value={isEditing ? editData.address : profile.address} 
                      isEditing={isEditing}
                      onChange={val => setEditData({...editData, address: val})}
                      wide 
                    />
                  </div>
                  <InfoCard 
                    label="Age" 
                    type="number"
                    value={isEditing ? editData.age : (profile.age ? `${profile.age} years old` : "Not specified")} 
                    isEditing={isEditing}
                    onChange={val => setEditData({...editData, age: val.slice(0, 2)})}
                  />
                  <InfoCard 
                    label="Birthday" 
                    type="date"
                    value={isEditing ? editData.birthday : (profile.birthday || "Not specified")} 
                    isEditing={isEditing}
                    onChange={val => setEditData({...editData, birthday: val})}
                  />
                </div>
              </div>
            </section>

          </>
        )}


        {activeTab === "Results" && <div className="p-20 text-center text-slate-400 font-bold">Results feature coming soon...</div>}
        {activeTab === "Settings" && <div className="p-20 text-center text-slate-400 font-bold">Settings feature coming soon...</div>}
      </main>
    </div>
  );
}

function InfoCard({ label, value, isEditing, onChange, wide, type = "text", options = [] }) {
  return (
    <div className={`space-y-2 ${wide ? "md:col-span-2 lg:col-span-3" : ""}`}>
      <label className="text-xs font-bold text-slate-400 uppercase ml-1">{label}</label>
      <div className={`w-full px-4 py-3 rounded-2xl border transition bg-slate-50/50 border-slate-100 ${isEditing ? "focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white" : ""}`}>
        {isEditing ? (
          type === "select" ? (
            <select 
              className="bg-transparent w-full outline-none text-slate-800 font-semibold cursor-pointer"
              value={value || ""}
              onChange={e => onChange(e.target.value)}
            >
              <option value="" disabled>Select {label}</option>
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input 
              type={type}
              className="bg-transparent w-full outline-none text-slate-800 font-semibold"
              value={value || ""}
              onChange={e => onChange(e.target.value)}
              onClick={e => type === 'date' && e.target.showPicker && e.target.showPicker()}
            />
          )
        ) : (
          <p className="text-slate-800 font-semibold">{value || "Not specified"}</p>
        )}
      </div>
    </div>
  );
}

