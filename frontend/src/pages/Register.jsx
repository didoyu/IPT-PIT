import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Image as ImageIcon, Lock, Mail, User, MapPin, Calendar, Hash } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirm_password: '',
    email: '',

    first_name: '',
    middle_name: '',
    last_name: '',

    section: '',
    school_year: '',

    address: '',
    age: '',
    birthday: '',
    profile_picture: null
  });

  const [error, setError] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // ✅ VALIDATION
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (
      !formData.section.trim() ||
      !formData.school_year.trim() ||
      formData.section.toLowerCase() === "n/a" ||
      formData.school_year.toLowerCase() === "n/a"
    ) {
      setError("Section and School Year cannot be empty or 'N/A'");
      return;
    }

    // Check all required fields (following user request "all fields will be required")
    const requiredFields = ['username', 'password', 'email', 'first_name', 'middle_name', 'last_name', 'address', 'age', 'birthday', 'section', 'school_year'];
    for (let field of requiredFields) {
      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        setError(`Please fill in all fields.`);
        return;
      }
    }

    if (!formData.profile_picture) {
      setError("Please upload a profile picture.");
      return;
    }

    // ✅ USE FORMDATA FOR FILE UPLOAD
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'confirm_password') {
        data.append(key, formData[key]);
      }
    });

    try {
      await axios.post('http://127.0.0.1:8000/api/register/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setIsRegistered(true);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    }
  };

  const inputStyle =
    "w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white";

  if (isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-slate-200">
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-inner">
              <CheckCircle size={48} strokeWidth={2.5} />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Congratulations!</h2>
            <p className="text-slate-600 mt-6 text-lg leading-relaxed">
              Welcome aboard, <span className="font-bold text-indigo-600">{formData.first_name}</span>! Your account has been created successfully.
            </p>
            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-indigo-700 text-sm font-medium">
                Please check your email <span className="underline">{formData.email}</span> to activate your account before logging in.
              </p>
            </div>
            <Link 
              to="/" 
              className="mt-10 inline-block w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-200"
            >
              Proceed to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 uppercase tracking-tight">Create Account</h1>
          <p className="text-slate-500 mt-2">Join the examination portal as a student</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl text-center font-bold animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">

          {/* ACCOUNT REGISTRATION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-xs font-black uppercase text-indigo-600 border-b-2 border-indigo-100 pb-2 mb-2">
                Account Registration
              </h2>
            </div>

            <div className="relative">
              <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                required
                className={`${inputStyle} pl-10`}
                placeholder="Username"
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                type="email"
                required
                className={`${inputStyle} pl-10`}
                placeholder="Email Address"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* PERSONAL NAME */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              required
              className={inputStyle}
              placeholder="First Name"
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />

            <input
              type="text"
              required
              className={inputStyle}
              placeholder="Middle Name"
              onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
            />

            <input
              type="text"
              required
              className={inputStyle}
              placeholder="Last Name"
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>

          {/* PERSONAL DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <MapPin className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                type="text"
                required
                className={`${inputStyle} pl-10`}
                placeholder="Full Address"
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="md:col-span-1 relative">
              <Hash className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                type="number"
                required
                min="1"
                max="99"
                className={`${inputStyle} pl-10`}
                placeholder="Age"
                onChange={(e) => {
                  const val = e.target.value.slice(0, 2);
                  setFormData({ ...formData, age: val });
                }}
                value={formData.age}
              />
            </div>

            <div className="md:col-span-1 relative">
              {!formData.birthday && (
                <div className="absolute inset-0 flex items-center pl-4 pointer-events-none text-slate-400">
                  <Calendar size={18} className="mr-2" />
                  <span className="text-sm font-medium uppercase text-[11px] font-black">Birthday</span>
                </div>
              )}
              <input
                type="date"
                required
                className={`${inputStyle} ${!formData.birthday ? 'text-transparent' : 'text-slate-900'} py-3 cursor-pointer`}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                onClick={(e) => e.target.showPicker && e.target.showPicker()}
              />
            </div>

          </div>

          {/* ACADEMIC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              required
              className={inputStyle}
              placeholder="Section (e.g. BSIT-4A)"
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            />

            <div className="relative">
              <select
                required
                className={`${inputStyle} text-center pr-10 appearance-none bg-white/60 backdrop-blur-sm font-bold text-slate-700`}
                value={formData.school_year}
                onChange={(e) => setFormData({ ...formData, school_year: e.target.value })}
              >
                <option value="" disabled className="text-slate-400">Select School Year</option>
                {Array.from({ length: 2026 - 1980 }, (_, i) => {
                  const year = 1980 + i;
                  const range = `${year}-${year + 1}`;
                  return (
                    <option key={range} value={range} className="text-slate-900">
                      {range}
                    </option>
                  );
                })}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>


          {/* PASSWORD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                type="password"
                required
                className={`${inputStyle} pl-10`}
                placeholder="Create Password"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                type="password"
                required
                className={`${inputStyle} pl-10`}
                placeholder="Confirm Password"
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              />
            </div>
          </div>

          {/* PROFILE PICTURE */}
          <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <label className="block text-xs font-black uppercase text-indigo-600 mb-3 flex items-center gap-2">
              <ImageIcon size={14} /> Profile Picture
            </label>
            <input
              type="file"
              required
              accept="image/*"
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
              onChange={(e) => setFormData({ ...formData, profile_picture: e.target.files[0] })}
            />
          </div>

          <button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition transform hover:scale-[1.01] active:scale-95 shadow-lg shadow-indigo-100">
            Create Account & Register
          </button>

          {/* LOGIN LINK */}
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/" className="text-indigo-600 font-bold hover:underline">
              Login here
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}