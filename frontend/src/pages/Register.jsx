import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const sections = Array.from({ length: 16 }, (_, index) => `IT3R${index + 1}`);
const currentYear = new Date().getFullYear();
const schoolYears = Array.from({ length: 5 }, (_, index) => `${currentYear + index - 1}-${currentYear + index}`);

// FIXED: Defensively avoids UTC timezone drops and safely filters out parsing failures
function calculateAge(birthday) {
  if (!birthday) return '';
  const today = new Date();
  const parts = birthday.split('-');
  if (parts.length !== 3) return '';

  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1; // JavaScript months are 0-indexed
  const birthDay = parseInt(parts[2], 10);

  if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) return '';

  let age = today.getFullYear() - birthYear;
  const monthDiff = today.getMonth() - birthMonth;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
    age -= 1;
  }
  return age;
}

function extractBackendErrorMessage(payload) {
  if (!payload) return 'Registration failed.';
  if (typeof payload.error === 'string' && payload.error.trim()) return payload.error;
  if (typeof payload.detail === 'string' && payload.detail.trim()) return payload.detail;

  // Handle serializer-like shapes: { field: ["message"] }
  for (const value of Object.values(payload)) {
    if (Array.isArray(value) && value.length > 0) {
      return String(value[0]);
    }
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return 'Registration failed.';
}

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    re_password: '',
    email: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    section: '',
    school_year: '',
    address: '',
    age: '',
    birthday: ''
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    email: ''
  });
  const navigate = useNavigate();

  // Visibility States for Password Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('auth');
    const isStaff = localStorage.getItem('isStaff') === 'true';
    if (auth) {
      navigate(isStaff ? '/admin' : '/profile', { replace: true });
    }
  }, [navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setFieldErrors({ username: '', email: '' });

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (profilePicture) {
      data.append('profile_picture', profilePicture);
    }

    try {
      const response = await axios.post('https://ipt-pitbackend.onrender.com/api/register/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const message = response.data?.message || 'Registration successful! Check your email to activate.';
      const emailStatus = response.data?.email_status;

      if (emailStatus === 'failed') {
        setSuccessMessage(message);
        alert(message);
      } else {
        alert(message);
      }

      navigate('/');
    } catch (err) {
      const backend = err.response?.data || {};
      const errorMsg = extractBackendErrorMessage(backend);
      const field = backend.field;

      if (field === 'username' || field === 'email') {
        setFieldErrors((prev) => ({ ...prev, [field]: errorMsg }));
      }

      setError(errorMsg);
      console.error(backend);
    }
  };

  const inputStyle = "w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none transition bg-white/80 text-slate-900";
  const selectStyle = "w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white/80 focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none transition text-slate-900";
  const labelStyle = "block text-xs font-semibold text-slate-700 mb-1";

  return (
    <div className="relative h-screen min-h-screen max-h-screen w-screen flex items-center justify-center px-4 overflow-hidden bg-purple-950">
      
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay pointer-events-none fixed"
        style={{ 
          backgroundImage: "url('/images/gwapo.jpg')" 
        }}
      />

      {/* Purple Overlay Tint */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/60 via-purple-950/40 to-indigo-900/50 pointer-events-none fixed" />

      {/* Form Container Card */}
      <div className="relative max-w-6xl w-full bg-white/95 backdrop-blur-md rounded-[24px] shadow-2xl p-6 md:p-8 border border-purple-100/20 z-10">
        
        {/* Header Section */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Your Account
          </h1>
          <p className="text-slate-500 text-sm mt-1">Join the student exam portal using the dynamic form registration below.</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 text-sm bg-red-50 border border-red-200 text-red-700 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-center font-medium">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* TWO-COLUMN CONTENT GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            
            {/* 📍 LEFT COLUMN: Personal and Academic Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-800 border-b border-purple-100 pb-1">Personal & Academic Info</h3>
              
              {/* Student Names Row */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelStyle}>First Name</label>
                  <input type="text" required className={inputStyle} placeholder="First" 
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
                </div>
                <div>
                  <label className={labelStyle}>Middle Name</label>
                  <input type="text" className={inputStyle} placeholder="Middle" 
                    value={formData.middle_name}
                    onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })} />
                </div>
                <div>
                  <label className={labelStyle}>Last Name</label>
                  <input type="text" required className={inputStyle} placeholder="Last" 
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
                </div>
              </div>

              {/* Personal Info Row (Birthday + Age) */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className={labelStyle}>Birthday</label>
                  <input type="date" required className={inputStyle}
                    value={formData.birthday}
                    onChange={(e) => {
                      const birthday = e.target.value;
                      setFormData({
                        ...formData,
                        birthday,
                        age: calculateAge(birthday)
                      });
                    }} />
                </div>
                <div>
                  <label className={labelStyle}>Age</label>
                  {/* FIXED: Removed conflicting text/background utilities from inputStyle */}
                  <input 
                    type="text" 
                    readOnly 
                    className="w-full px-3 py-2 text-sm rounded-xl border border-purple-100/70 outline-none bg-purple-50/40 font-medium text-purple-900 cursor-not-allowed" 
                    placeholder="Auto" 
                    value={formData.age !== '' ? `${formData.age} yrs` : ''} 
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className={labelStyle}>Address</label>
                <input type="text" required className={inputStyle} placeholder="Current home address" 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>

              {/* Academic Info Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelStyle}>Section</label>
                  <select required className={selectStyle} value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}>
                    <option value="">Select section</option>
                    {sections.map(section => (
                      <option key={section} value={section}>{section}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelStyle}>School Year</label>
                  <select required className={selectStyle} value={formData.school_year}
                    onChange={(e) => setFormData({ ...formData, school_year: e.target.value })}>
                    <option value="">Select year</option>
                    {schoolYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 🔑 RIGHT COLUMN: Account Credentials & Security Media */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-800 border-b border-purple-100 pb-1">Account Credentials</h3>
              
              {/* Account Credentials Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelStyle}>Username</label>
                  <input type="text" required className={inputStyle} placeholder="Username" 
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                  {fieldErrors.username && (
                    <p className="mt-1 text-xs text-red-600 font-semibold">{fieldErrors.username}</p>
                  )}
                </div>
                <div>
                  <label className={labelStyle}>Email</label>
                  <input type="email" required className={inputStyle} placeholder="Email address" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-600 font-semibold">{fieldErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Passwords Security Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelStyle}>Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} required className={`${inputStyle} pr-10`} placeholder="••••••••" 
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors focus:outline-none"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelStyle}>Confirm Password</label>
                  <div className="relative">
                    <input type={showRePassword ? "text" : "password"} required className={`${inputStyle} pr-10`} placeholder="••••••••" 
                      value={formData.re_password}
                      onChange={(e) => setFormData({ ...formData, re_password: e.target.value })} />
                    <button 
                      type="button"
                      onClick={() => setShowRePassword(!showRePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors focus:outline-none"
                    >
                      {showRePassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Profile Picture Box */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-purple-900 mb-1">Profile Picture Attachment</label>
                <div className="bg-purple-50/40 px-4 py-2.5 rounded-xl border border-dashed border-purple-300/70 transition hover:bg-purple-50/60">
                  <input type="file" accept="image/*" className="text-xs text-slate-600 w-full file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 file:cursor-pointer"
                    onChange={(e) => setProfilePicture(e.target.files[0])} />
                </div>
              </div>
            </div>

          </div>

          {/* Action Button Controls */}
          <div className="pt-2">
            <button type="submit" className="w-full bg-purple-700 hover:bg-purple-600 text-white py-3 rounded-2xl font-bold shadow-lg shadow-purple-900/10 active:scale-[0.99] transition text-sm tracking-wide">
              Register Account
            </button>
          </div>
        </form>

        {/* Back to Login Nav Link */}
        <div className="mt-4 pt-4 border-t border-slate-100 text-center">
          <p className="text-slate-600 text-xs">
            Already have an account?{' '}
            <Link to="/" className="text-purple-700 font-bold hover:text-purple-600 transition-colors">
              Sign In here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}