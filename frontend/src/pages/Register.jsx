import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',

    first_name: '',
    middle_name: '',
    last_name: '',

    section: '',
    school_year: '',

    // ✅ NEW FIELDS
    address: '',
    age: '',
    birthday: ''
  });

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // ✅ VALIDATION
    if (
      !formData.section.trim() ||
      !formData.school_year.trim() ||
      formData.section.toLowerCase() === "n/a" ||
      formData.school_year.toLowerCase() === "n/a"
    ) {
      setError("Section and School Year cannot be empty or 'N/A'");
      return;
    }

    if (!formData.first_name || !formData.last_name) {
      setError("First name and Last name are required.");
      return;
    }

    if (!formData.address || !formData.age || !formData.birthday) {
      setError("Please fill in all personal details (address, age, birthday).");
      return;
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/register/', formData);
      alert("Registration successful! Please login.");
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    }
  };

  const inputStyle =
    "w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-12">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-200">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 uppercase">Create Account</h1>
          <p className="text-slate-500 mt-2">Join the examination portal as a student</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">

          {/* ACCOUNT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-xs font-black uppercase text-indigo-600 border-b pb-2 mb-4">
                Account Security
              </h2>
            </div>

            <input
              type="text"
              required
              className={inputStyle}
              placeholder="Username"
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />

            <input
              type="email"
              required
              className={inputStyle}
              placeholder="Email"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          {/* PERSONAL NAME */}
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              required
              className={inputStyle}
              placeholder="First Name"
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />

            <input
              type="text"
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              required
              className={inputStyle}
              placeholder="Address"
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />

            <input
              type="number"
              required
              className={inputStyle}
              placeholder="Age"
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />

            <input
              type="date"
              required
              className={inputStyle}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
            />
          </div>

          {/* ACADEMIC */}
          <div className="grid grid-cols-2 gap-6">
            <input
              type="text"
              required
              className={inputStyle}
              placeholder="Section (e.g. BSIT-4A)"
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            />

            <select
              required
              className={inputStyle}
              value={formData.school_year}
              onChange={(e) => setFormData({ ...formData, school_year: e.target.value })}
            >
              <option value="" disabled>Select School Year</option>
              {Array.from({ length: 2026 - 1980 }, (_, i) => {
                const year = 1980 + i;
                const range = `${year}-${year + 1}`;
                return (
                  <option key={range} value={range}>
                    {range}
                  </option>
                );
              })}
            </select>
          </div>

          {/* PASSWORD */}
          <input
            type="password"
            required
            className={inputStyle}
            placeholder="Password"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition">
            Register
          </button>

          {/* LOGIN LINK */}
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/" className="text-indigo-600 font-bold">
              Login
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}