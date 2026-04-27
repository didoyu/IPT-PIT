import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ActivateAccount() {
  const { uid, token } = useParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const activate = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/activate/${uid}/${token}/`);
        setStatus('success');
        setMessage(response.data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Activation failed. The link may be expired.');
      }
    };

    activate();
  }, [uid, token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center border border-slate-200">
        
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">Activating...</h2>
            <p className="text-slate-500 mt-2">Please wait while we verify your account.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <CheckCircle className="w-20 h-20 text-emerald-500 mb-4" />
            <h2 className="text-3xl font-extrabold text-slate-900">Success!</h2>
            <p className="text-slate-600 mt-3 text-lg">{message}</p>
            <Link 
              to="/" 
              className="mt-8 inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
            >
              Go to Login
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
            <XCircle className="w-20 h-20 text-rose-500 mb-4" />
            <h2 className="text-3xl font-extrabold text-slate-900">Oops!</h2>
            <p className="text-slate-600 mt-3 text-lg">{message}</p>
            <div className="flex gap-4 mt-8">
              <Link 
                to="/register" 
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition"
              >
                Try Registering Again
              </Link>
              <Link 
                to="/" 
                className="bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-bold hover:bg-slate-300 transition"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
