import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Compass, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  RefreshCw 
} from 'lucide-react';

export default function ActivateAccount() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('activating');
  const initialized = React.useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      const activate = async () => {
  try {
    // 🌐 SWAP 127.0.0.1 FOR YOUR ACTUAL LOCAL NETWORK IP
    await axios.post('http://192.168.18.38:8000/api/auth/users/activation/', {
      uid,
      token
    });
    setStatus('success');
    setTimeout(() => navigate('/'), 3000);
  } catch (err) {
    setStatus('error');
    console.error("Activation Handshake Error:", err.response?.data || err);
  }
};
      activate();
    }
  }, [uid, token, navigate]);

  return (
    // MATCHED: Standard layout wrapper and background canvas rules
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen bg-slate-50 flex flex-col justify-between">
      <div className="space-y-8 w-full">
        
        {/* 1. MATCHED: REFINED MINIMALIST HEADER */}
        <header className="border-b border-slate-200/60 pb-6">
          <div className="flex items-center gap-1.5 mb-2">
            <Compass size={14} className="text-purple-600" />
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">
              Authorization Gateway Network
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            Account Activation
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1 max-w-3xl leading-relaxed">
            Cryptographic authentication processing block. Validating signature tokens with centralized node registries.
          </p>
        </header>

        {/* 2. MATCHED: SUBTLE STATUS CONTROLS BAR */}
        <div className="flex items-center gap-2 mb-2">
          <Layers size={14} className="text-purple-600" />
          <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest">
            Verification Protocol Stack
          </h2>
        </div>

        {/* 3. MATCHED: CARD STATUS CONTAINER LAYOUT */}
        <div className="max-w-md mx-auto pt-6 w-full">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center justify-center min-h-[280px]">
            
            {/* Activating Sequence Block */}
            {status === 'activating' && (
              <div className="space-y-6 w-full flex flex-col items-center">
                <div className="text-purple-600 animate-spin">
                  <RefreshCw size={28} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">
                    Running Token Match
                  </h3>
                  <p className="text-slate-500 text-xs font-medium mt-1.5 leading-relaxed px-4">
                    Synchronizing network configuration matrices. Please do not close this deployment route.
                  </p>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden max-w-xs">
                  <div className="h-full bg-purple-600 rounded-full animate-[loading_1.5s_ease-in-out_infinite] w-1/3" style={{
                    animationName: 'shimmer',
                    animationDuration: '1.5s',
                    animationIterationCount: 'infinite'
                  }} />
                  <style>{`
                    @keyframes shimmer {
                      0% { transform: translateX(-100%); }
                      100% { transform: translateX(300%); }
                    }
                  `}</style>
                </div>
              </div>
            )}

            {/* Success Validation Block */}
            {status === 'success' && (
              <div className="space-y-6 w-full flex flex-col items-center">
                <div className="text-emerald-600 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
                  <CheckCircle2 size={28} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">
                    Clearance Confirmed
                  </h3>
                  <p className="text-slate-500 text-xs font-medium mt-1.5 leading-relaxed px-4">
                    Identity parameters verified successfully. Initializing default router mapping configuration.
                  </p>
                  <span className="inline-block text-[9px] font-black text-purple-600 tracking-widest uppercase mt-4 animate-pulse">
                    Redirecting to portal hub...
                  </span>
                </div>
                <button 
                  onClick={() => navigate('/')}
                  className="bg-purple-50 text-purple-700 border border-purple-100 px-5 py-2.5 rounded-xl text-xs font-black hover:bg-purple-700 hover:text-white transition-all duration-150 flex items-center gap-1.5 uppercase"
                >
                  Enter Portal <ArrowRight size={12} />
                </button>
              </div>
            )}

            {/* Error Handshake Block */}
            {status === 'error' && (
              <div className="space-y-6 w-full flex flex-col items-center">
                <div className="text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-xl">
                  <AlertCircle size={28} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-800 uppercase tracking-tight">
                    Token Handshake Failed
                  </h3>
                  <p className="text-slate-500 text-xs font-medium mt-1.5 leading-relaxed px-2">
                    The requested validation signature has either structural defects, expired lifecycles, or was consumed prior.
                  </p>
                </div>
                
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 w-full text-left">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Recommended Procedures</span>
                  <ul className="text-[11px] font-bold text-slate-600 space-y-1 list-disc list-inside">
                    <li>Re-issue authorization trigger sequence</li>
                    <li>Contact internal terminal administrators</li>
                  </ul>
                </div>

                <div className="flex items-center gap-3 w-full">
                  <button 
                    onClick={() => navigate('/')}
                    className="flex-1 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-black hover:bg-slate-50 transition-all duration-150 uppercase"
                  >
                    Return
                  </button>
                  <button 
                    onClick={() => navigate('/register')}
                    className="flex-1 bg-purple-50 text-purple-700 border border-purple-100 px-4 py-2.5 rounded-xl text-xs font-black hover:bg-purple-700 hover:text-white transition-all duration-150 uppercase"
                  >
                    Reset Pipeline
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Persistent Technical Footnote */}
      <footer className="text-center text-[10px] font-black text-slate-400 tracking-widest uppercase pt-6">
        Node: System_Auth_Gateway_v2.0
      </footer>
    </div>
  );
}