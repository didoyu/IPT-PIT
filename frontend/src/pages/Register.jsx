import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

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

  const inputStyle = "w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 py-12 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
        <h1 className="text-3xl font-extrabold text-center mb-8 uppercase">Create Account</h1>
        
        {error && <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-center">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-6">
          
          {/* USERNAME & EMAIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <input type="text" required className={inputStyle} placeholder="Username" 
               onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
             <input type="email" required className={inputStyle} placeholder="Email" 
               onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>

          {/* NAMES */}
          <div className="grid grid-cols-3 gap-4">
             <input type="text" required className={inputStyle} placeholder="First Name" 
               onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
             <input type="text" className={inputStyle} placeholder="Middle Name" 
               onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })} />
             <input type="text" required className={inputStyle} placeholder="Last Name" 
               onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
          </div>

          {/* ADDRESS & AGE & BIRTHDAY */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <input type="text" required className={inputStyle} placeholder="Address" 
               onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
             <input type="number" required className={inputStyle} placeholder="Age" 
               onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
             <input type="date" required className={inputStyle} 
               onChange={(e) => setFormData({ ...formData, birthday: e.target.value })} />
          </div>

          {/* SECTION & SCHOOL YEAR */}
          <div className="grid grid-cols-2 gap-6">
             <input type="text" required className={inputStyle} placeholder="Section (e.g. BSIT-3A)" 
               onChange={(e) => setFormData({ ...formData, section: e.target.value })} />
             <input type="text" required className={inputStyle} placeholder="School Year" 
               onChange={(e) => setFormData({ ...formData, school_year: e.target.value })} />
          </div>

          {/* PROFILE PICTURE */}
          <div className="bg-slate-50 p-4 rounded-lg border-2 border-dashed border-slate-300">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Profile Picture</label>
            <input type="file" accept="image/*" className="text-sm"
              onChange={(e) => setProfilePicture(e.target.files[0])} />
          </div>

          {/* PASSWORDS */}
          <div className="grid grid-cols-2 gap-6">
            <input type="password" required className={inputStyle} placeholder="Password" 
               onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            <input type="password" required className={inputStyle} placeholder="Confirm Password" 
               onChange={(e) => setFormData({ ...formData, re_password: e.target.value })} />
          </div>

          <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">
            Register Account
          </button>
        </form>
      </div>
    </div>
  );
}