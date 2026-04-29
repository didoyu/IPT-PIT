import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, Loader2, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";
import axios from "axios";

export default function TwoFactorWaiting() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("waiting");
  const [code, setCode] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const inputRefs = useRef([]);

  const approvalToken = location.state?.approvalToken;
  const userEmail = location.state?.email;

  useEffect(() => {
    if (!approvalToken) {
      navigate("/login");
    }
  }, [approvalToken, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newCode = [...code];
    newCode[index] = element.value;
    setCode(newCode);

    // Focus next input
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const data = e.clipboardData.getData("text").slice(0, 6).split("");
    if (data.length === 6 && data.every(char => !isNaN(char))) {
      setCode(data);
      inputRefs.current[5].focus();
    }
    e.preventDefault();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/verify-2fa/", {
        token: approvalToken,
        code: fullCode
      });
      
      if (res.data.status === "approved") {
        setStatus("approved");
        
        // Store authentication details
        localStorage.setItem("auth", res.data.token);
        localStorage.setItem("user", res.data.username);
        localStorage.setItem("isStaff", res.data.is_staff.toString());

        // Redirect to profile after a brief delay
        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await axios.post("http://127.0.0.1:8000/api/resend-2fa/", {
        token: approvalToken
      });
      setSuccessMsg("A new code has been sent to your email!");
      setCode(new Array(6).fill(""));
      inputRefs.current[0].focus();
    } catch (err) {
      setErrorMsg("Failed to resend code. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Two-Factor Authentication
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          We need to verify it's really you.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center space-y-6">
          
          {status === "waiting" && (
            <>
              <div className="mx-auto w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                <Mail size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Check Your Email</h3>
                <p className="mt-2 text-sm text-slate-500">
                  We've sent a 6-digit code to <span className="font-semibold text-slate-800">{userEmail || "your email address"}</span>.
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex justify-between gap-2 px-2">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      ref={(el) => (inputRefs.current[index] = el)}
                      className="w-12 h-14 text-center text-2xl font-black rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-slate-50 shadow-sm"
                      value={digit}
                      onChange={(e) => handleChange(e.target, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={handlePaste}
                      required
                    />
                  ))}
                </div>

                {errorMsg && <p className="text-sm font-bold text-rose-500 animate-pulse">{errorMsg}</p>}
                {successMsg && <p className="text-sm font-bold text-emerald-500">{successMsg}</p>}

                <button
                  type="submit"
                  disabled={loading || code.some(d => d === "")}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-100 text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : "Verify Code"}
                </button>
              </form>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="flex items-center justify-center gap-2 mx-auto text-sm font-bold text-slate-500 hover:text-indigo-600 transition"
              >
                {resending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                Resend Code
              </button>
            </>
          )}

          {status === "approved" && (
            <div className="animate-in fade-in zoom-in duration-500 space-y-4">
              <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Login Approved!</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Redirecting you to your profile...
                </p>
              </div>
              <div className="flex justify-center text-emerald-600">
                <ArrowRight className="animate-bounce" />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
