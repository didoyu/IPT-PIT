import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, User, Lock, KeyRound, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff, RefreshCw } from "lucide-react";
import axios from "axios";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Request Code, 2: Reset Password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    code: new Array(6).fill(""),
    newPassword: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCodeChange = (digit, index) => {
    if (isNaN(digit)) return;
    const newCode = [...formData.code];
    newCode[index] = digit;
    setFormData({ ...formData, code: newCode });

    if (digit !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !formData.code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("http://127.0.0.1:8000/api/forgot-password/", {
        username: formData.username,
        email: formData.email
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await axios.post("http://127.0.0.1:8000/api/reset-password/", {
        username: formData.username,
        code: formData.code.join(""),
        new_password: formData.newPassword
      });
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/"), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid code or request failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post("http://127.0.0.1:8000/api/resend-password-reset/", {
        username: formData.username,
        email: formData.email
      });
      setSuccess("A new reset code has been sent!");
      setFormData({ ...formData, code: new Array(6).fill("") });
      inputRefs.current[0].focus();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl p-8 border border-slate-100">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <KeyRound size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Forgot Password?</h1>
          <p className="text-slate-500 font-medium mt-1">
            {step === 1 ? "Enter your details to receive a reset code." : "Enter the code and your new password."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-2xl font-bold flex items-center gap-2 animate-shake">
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm rounded-2xl font-bold flex items-center gap-2">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestCode} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="text" 
                  name="username"
                  className="w-full px-4 py-3.5 pl-12 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold"
                  placeholder="Your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input 
                  type="email" 
                  name="email"
                  className="w-full px-4 py-3.5 pl-12 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold"
                  placeholder="Your registered email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Send Reset Code"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase text-center block mb-2">Reset Code</label>
              <div className="flex justify-between gap-2 px-2">
                {formData.code.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="w-10 h-12 text-center text-xl font-black rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition bg-slate-50"
                    value={digit}
                    onChange={(e) => handleCodeChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    required
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="newPassword"
                    className="w-full px-4 py-3.5 pl-12 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold"
                    placeholder="Minimum 8 characters"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400 hover:text-indigo-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase ml-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="confirmPassword"
                    className="w-full px-4 py-3.5 pl-12 rounded-2xl border border-slate-100 bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 transition font-bold"
                    placeholder="Repeat new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Reset Password"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Resend Code
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-50 text-center">
          <Link to="/" className="text-indigo-600 font-bold text-sm hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
