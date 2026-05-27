import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      const response = await axios.post('https://ipt-pit-lgr4.onrender.com/api/login/', {
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

  // ✅ UPDATED: Shifted input focus states to match the new purple theme
  const inputStyle = 'w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none transition bg-white/80';

  return (
    // ✅ NEW: Main container with a deep purple base background
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-purple-950">
      
      {/* 📸 NEW: Student Background Image Layer with custom Opacity */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay pointer-events-none"
        style={{ 
          backgroundImage: "url('/images/gwapo.jpg')" // 👈 Replace this path with your local image asset or public URL
        }}
      />

      {/* 💜 NEW: Purple Transparent Overlay Gradient (Gives it that modern cinematic tint) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/60 via-purple-950/40 to-indigo-900/50 pointer-events-none" />

      {/* Login Card Container - Slight backdrop blur adds a premium glass finish */}
      <div className="relative max-w-md w-full bg-white/95 backdrop-blur-md rounded-[28px] shadow-2xl p-10 border border-purple-100/20 z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Student Exam Portal
          </h1>
          <p className="text-slate-500 mt-3">Sign in to access your dashboard.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username Input */}
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

          {/* Password Input with Eye Icon */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`${inputStyle} pr-12`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              
              {/* Interactive Eye Icon Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-purple-600 transition"
              >
                {showPassword ? (
                  /* Eye Slash Icon (Hide Password) */
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  /* Eye Icon (Show Password) */
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            // ✅ UPDATED: Shifted button colors from indigo to vibrant purple theme
            className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold py-4 rounded-3xl shadow-xl shadow-purple-900/20 active:scale-[0.99] transition"
          >
            Sign In
          </button>
        </form>

        {/* Bottom Registration Link */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-slate-600 text-sm">
            Don't have an account?{' '}
            {/* ✅ UPDATED: Text color shifted to match theme */}
            <Link to="/register" className="text-purple-700 font-bold hover:text-purple-600 transition-colors">
              Sign up as a Student
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}