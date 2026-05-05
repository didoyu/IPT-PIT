import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem('auth');
    const isStaff = localStorage.getItem('isStaff') === 'true';
    if (auth) {
      navigate(isStaff ? '/admin' : '/profile', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username,
        password,
      });

      const { token, is_staff, username: dbUsername } = response.data;

      localStorage.setItem('auth', token);
      localStorage.setItem('user', dbUsername);
      localStorage.setItem('isStaff', is_staff.toString());

      if (is_staff) {
        navigate('/admin');
      } else {
        navigate('/profile');
      }

    } catch (err) {
      setError('Invalid username or password. Please try again.');
    }
  };

  const inputStyle = 'w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-white px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-[28px] shadow-2xl p-10 border border-slate-200">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 mt-3">Sign in to continue to the student exam portal.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Username</label>
            <input
              type="text"
              className={inputStyle}
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <input
              type="password"
              className={inputStyle}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white font-bold py-4 rounded-3xl shadow-xl shadow-indigo-200 hover:opacity-95 transition"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-600 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-500 transition-colors">
              Sign up as a Student
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center text-xs text-slate-400 uppercase tracking-widest">Capstone Project 2026</div>
      </div>
    </div>
  );
}