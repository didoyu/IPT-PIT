import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const sections = Array.from({ length: 16 }, (_, index) => `IT3R${index + 1}`);
const currentYear = new Date().getFullYear();
const schoolYears = Array.from({ length: 5 }, (_, index) => `${currentYear + index - 1}-${currentYear + index}`);

function calculateAge(birthday) {
  if (!birthday) return '';
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
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
  const navigate = useNavigate();

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

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (profilePicture) {
      data.append('profile_picture', profilePicture);
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/register/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Registration successful! Check your email to activate.");
      navigate('/');
    } catch (err) {
  // This will show you exactly what the backend didn't like
    const errorMsg = err.response?.data?.error || "Registration failed.";
    setError(errorMsg);
    console.error(err.response?.data); 
}
  };

  const inputStyle = "w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition";
  const selectStyle = "w-full px-4 py-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-white py-12 px-4">
      <div className="max-w-3xl w-full bg-white rounded-[30px] shadow-2xl p-10 border border-slate-200">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 uppercase tracking-tight">Create Your Account</h1>
          <p className="text-slate-500 mt-3">Sign up with a secure account and join the student exam portal.</p>
        </div>
        
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center font-medium">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
              <input type="text" required className={inputStyle} placeholder="Username" 
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <input type="email" required className={inputStyle} placeholder="Email address" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
              <input type="text" required className={inputStyle} placeholder="First Name" 
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Middle Name</label>
              <input type="text" className={inputStyle} placeholder="Middle Name" 
                value={formData.middle_name}
                onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
              <input type="text" required className={inputStyle} placeholder="Last Name" 
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Birthday</label>
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
              <label className="block text-sm font-semibold text-slate-700 mb-2">Age</label>
              <input type="text" readOnly className={inputStyle + " bg-slate-50 cursor-not-allowed"} placeholder="Auto-calculated" 
                value={formData.age ? `${formData.age} years` : ''} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
              <input type="text" required className={inputStyle} placeholder="Address" 
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Section</label>
              <select required className={selectStyle} value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}>
                <option value="">Select section</option>
                {sections.map(section => (
                  <option key={section} value={section}>{section}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">School Year</label>
              <select required className={selectStyle} value={formData.school_year}
                onChange={(e) => setFormData({ ...formData, school_year: e.target.value })}>
                <option value="">Select school year</option>
                {schoolYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-3xl border border-dashed border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Profile Picture</label>
            <input type="file" accept="image/*" className="text-sm text-slate-600"
              onChange={(e) => setProfilePicture(e.target.files[0])} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <input type="password" required className={inputStyle} placeholder="Password" 
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
              <input type="password" required className={inputStyle} placeholder="Confirm Password" 
                value={formData.re_password}
                onChange={(e) => setFormData({ ...formData, re_password: e.target.value })} />
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white py-4 rounded-3xl font-bold shadow-xl shadow-indigo-200 hover:opacity-95 transition">
            Register Account
          </button>
        </form>
      </div>
    </div>
  );
}
