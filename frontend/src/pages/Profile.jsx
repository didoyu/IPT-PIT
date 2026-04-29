import { useEffect, useState, useRef } from "react";
import axios from "axios";

import { Camera, Edit2, Check, X, Mail, ShieldCheck, Scissors, Moon, Sun, Bell, Lock, Shield, Eye, EyeOff, KeyRound, MonitorSmartphone, Type, LogOut } from "lucide-react";

import ImageCropper from "../components/ImageCropper";



export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Profile");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const editImageRef = useRef(null);


  const tabs = ["Profile", "Results", "Settings"];

  // ✅ Missing State Declarations
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [emailStatus, setEmailStatus] = useState("");
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);

  // Settings States
  const [emailAlerts, setEmailAlerts] = useState(true);

  const [privacyMode, setPrivacyMode] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old: "", new: "", confirm: "" });
  const [passwordStatus, setPasswordStatus] = useState({ type: "", msg: "" });

  // New Features States
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [examFontSize, setExamFontSize] = useState(16);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activityStatus, setActivityStatus] = useState("Online");
  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: "Chrome on Windows", location: "Cagayan de Oro, PH", current: true },
    { id: 2, device: "Edge on Windows", location: "Cagayan de Oro, PH", current: false }
  ]);







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
      setTwoFactorAuth(data.is_2fa_enabled);
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
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedFile, previewUrl) => {
    setNewImage(croppedFile);
    setImagePreview(previewUrl);
    setImageToCrop(null);
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

  const handleToggle2FA = async () => {
    const newValue = !twoFactorAuth;
    setTwoFactorAuth(newValue);
    
    const token = localStorage.getItem("auth");
    const formData = new FormData();
    formData.append("is_2fa_enabled", newValue);
    
    try {
      await axios.post("http://127.0.0.1:8000/api/profile/update/", formData, {
        headers: { Authorization: `Token ${token}` }
      });
    } catch (err) {
      console.error("Failed to toggle 2FA", err);
      // Revert if failed
      setTwoFactorAuth(!newValue);
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordStatus({ type: "error", msg: "New passwords do not match" });
      return;
    }
    try {
      await axios.post("http://127.0.0.1:8000/api/profile/change-password/", {
        old_password: passwordForm.old,
        new_password: passwordForm.new
      }, {
        headers: { Authorization: `Token ${localStorage.getItem("auth")}` }
      });
      setPasswordStatus({ type: "success", msg: "Password updated successfully!" });
      setPasswordForm({ old: "", new: "", confirm: "" });
      setTimeout(() => setPasswordStatus({ type: "", msg: "" }), 3000);
    } catch (err) {
      setPasswordStatus({ type: "error", msg: err.response?.data?.error || "Failed to change password" });
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
    <div className="min-h-screen bg-slate-50 flex transition-colors duration-300">
      {/* SIDEBAR */}
      <aside className="w-56 bg-white border-r border-slate-100 flex flex-col items-center py-10 px-4 gap-6 transition-colors duration-300">



        {/* AVATAR */}
        <div
          className="relative group"
          style={{ width: '96px', height: '96px' }}
        >




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
            className="absolute inset-0 group-hover:bg-black group-hover:bg-opacity-40 transition-all flex items-center justify-center cursor-pointer"
            style={{ borderRadius: '50%' }}
            onClick={(e) => {
              e.stopPropagation();
              if (!isEditing) setIsEditing(true);
              setTimeout(() => editImageRef.current.click(), 100);
            }}
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
              onClick={(e) => {
                e.stopPropagation();
                editImageRef.current.click();
              }}
              className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition z-20"
            >
              <Camera size={18} />
            </button>
          )}

          <input type="file" ref={editImageRef} className="hidden" accept="image/*" onChange={handleImageChange} />

        </div>

        {/* NAME */}
        <div className="text-center">
          <p className="font-black text-slate-800 text-base capitalize transition-colors duration-300">
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
              activeTab === "Profile" && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 rounded-xl bg-white border-2 border-slate-100 text-slate-700 font-bold hover:border-indigo-100 hover:bg-indigo-50/30 transition flex items-center gap-2 shadow-sm"
                >
                  <Edit2 size={18} className="text-indigo-600" /> Edit Profile
                </button>
              )
            )}
          </div>
        </div>
        {activeTab === "Profile" && (
          <>
            <section className="space-y-8">
              {/* ACADEMIC & ACCOUNT */}
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6 transition-colors duration-300">
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
              <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6 transition-colors duration-300">
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
                    type="text"

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
        
        {activeTab === "Settings" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* APPEARANCE SECTION */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                  <Sun size={20} />
                </div>
                <h3 className="font-black text-slate-900 tracking-tight">Appearance</h3>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-400">
                      <Type size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Exam Font Size</h4>
                      <p className="text-xs font-medium text-slate-400">Adjust the text size during exams.</p>
                    </div>
                  </div>
                  <span className="font-black text-indigo-600">{examFontSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="12" 
                  max="24" 
                  value={examFontSize} 
                  onChange={(e) => setExamFontSize(e.target.value)}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-400 text-xs font-bold uppercase mb-3 tracking-widest">Preview</p>
                  <p className="text-slate-800 transition-all duration-200" style={{ fontSize: `${examFontSize}px` }}>
                    This is how your exam questions will appear on the screen.
                  </p>
                </div>

              </div>
            </div>

            {/* SECURITY SECTION */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Lock size={20} />
                </div>
                <h3 className="font-black text-slate-900 tracking-tight">Security</h3>
              </div>
              
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div className="space-y-1 relative">
                  <label className="text-xs font-black text-slate-400 uppercase ml-1">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showOldPassword ? "text" : "password"}
                      required
                      className="w-full px-4 py-3 pr-10 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:ring-2 focus:ring-indigo-500 transition font-semibold"
                      value={passwordForm.old}
                      onChange={e => setPasswordForm({...passwordForm, old: e.target.value})}
                    />
                    <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-indigo-500">
                      {showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 relative">
                    <label className="text-xs font-black text-slate-400 uppercase ml-1">New Password</label>
                    <div className="relative">
                      <input 
                        type={showNewPassword ? "text" : "password"}
                        required
                        className="w-full px-4 py-3 pr-10 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:ring-2 focus:ring-indigo-500 transition font-semibold"
                        value={passwordForm.new}
                        onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-indigo-500">
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 relative">
                    <label className="text-xs font-black text-slate-400 uppercase ml-1">Confirm New</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        className="w-full px-4 py-3 pr-10 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:ring-2 focus:ring-indigo-500 transition font-semibold"
                        value={passwordForm.confirm}
                        onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-indigo-500">
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
                {passwordStatus.msg && (
                  <p className={`text-xs font-bold ${passwordStatus.type === "error" ? "text-rose-500" : "text-emerald-500"}`}>
                    {passwordStatus.msg}
                  </p>
                )}
                <button 
                  type="submit"
                  className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-slate-800 transition active:scale-95 flex items-center gap-2"
                >
                  <KeyRound size={16} /> Update Password
                </button>
              </form>

              <div className="pt-6 border-t border-slate-100 space-y-6">
                <SettingItem 
                  icon={<ShieldCheck size={18} />}
                  title="Two-Factor Authentication (2FA)"
                  description="Enable extra security to prevent unauthorized access."
                  control={
                    <ToggleButton 
                      active={twoFactorAuth} 
                      onClick={handleToggle2FA} 
                    />
                  }
                />
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <MonitorSmartphone size={18} className="text-slate-400" />
                  <h4 className="font-bold text-slate-800 text-sm">Active Sessions</h4>
                </div>
                {activeSessions.map(session => (
                  <div key={session.id} className="flex justify-between items-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{session.device} {session.current && <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] rounded-full uppercase tracking-wider">Current</span>}</p>
                      <p className="text-xs font-medium text-slate-400">{session.location}</p>
                    </div>
                    {!session.current && (
                      <button className="text-rose-500 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-xl transition">
                        <LogOut size={16} />
                      </button>
                    )}
                  </div>
                ))}
                {activeSessions.length > 1 && (
                  <button 
                    onClick={() => {
                      setActiveSessions(activeSessions.filter(s => s.current));
                      alert("Successfully logged out of all other devices.");
                    }}
                    className="w-full py-3 mt-2 text-sm font-bold text-rose-500 border border-rose-100 rounded-2xl hover:bg-rose-50 transition"
                  >
                    Logout all other devices
                  </button>
                )}
              </div>
            </div>


            {/* NOTIFICATIONS SECTION */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                  <Bell size={20} />
                </div>
                <h3 className="font-black text-slate-900 tracking-tight">Notifications</h3>
              </div>
              <SettingItem 
                icon={<Mail size={18} />}
                title="Email Alerts"
                description="Receive updates about new exams and deadlines."
                control={
                  <ToggleButton 
                    active={emailAlerts} 
                    onClick={() => setEmailAlerts(!emailAlerts)} 
                  />
                }
              />
            </div>

            {/* PRIVACY SECTION */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                  <Shield size={20} />
                </div>
                <h3 className="font-black text-slate-900 tracking-tight">Privacy</h3>
              </div>
              <SettingItem 
                icon={<Eye size={18} />}
                title="Profile Visibility"
                description="Allow classmates to see your basic information."
                control={
                  <ToggleButton 
                    active={privacyMode} 
                    onClick={() => setPrivacyMode(!privacyMode)} 
                  />
                }
              />
              <div className="pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="text-slate-400">
                      <div className={`w-2.5 h-2.5 rounded-full ${activityStatus === "Online" ? "bg-emerald-500" : "bg-amber-500"} shadow-sm`}></div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Activity Status</h4>
                      <p className="text-xs font-medium text-slate-400">Show others what you're currently doing.</p>
                    </div>
                  </div>
                  <select 
                    className="bg-slate-50 border border-slate-100 text-slate-800 text-sm font-bold rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    value={activityStatus}
                    onChange={(e) => setActivityStatus(e.target.value)}
                  >
                    <option value="Online">Online</option>
                    <option value="Taking an Exam">Taking an Exam</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>


      {/* IMAGE CROPPER MODAL */}
      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={onCropComplete}
          onCancel={() => setImageToCrop(null)}
        />
      )}
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

function SettingItem({ icon, title, description, control }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
      <div className="flex items-center gap-4">
        <div className="text-slate-400">
          {icon}
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
          <p className="text-xs font-medium text-slate-400">{description}</p>
        </div>
      </div>
      {control}
    </div>
  );
}

function ToggleButton({ active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 flex items-center ${active ? "bg-indigo-600 dark:bg-indigo-500" : "bg-slate-200 dark:bg-slate-600"}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${active ? "translate-x-6" : "translate-x-0"}`} />
    </button>
  );
}


