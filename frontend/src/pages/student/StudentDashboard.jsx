import { useEffect, useState } from 'react';
import axios from 'axios';
import { Award, Layers, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StudentDashboard() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('auth');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/student-results/', {
          headers: { Authorization: `Token ${token}` }
        });
        setResults(res.data);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center text-xs font-black text-purple-600 uppercase tracking-widest animate-pulse">
          Synchronizing Academic Registry...
        </div>
      </div>
    );
  }

  return (
    // MATCHED: Identical wrapper to ExamList.jsx
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen bg-slate-50">
      
      {/* 1. MATCHED: REFINED MINIMALIST HEADER */}
      <header className="border-b border-slate-200/60 pb-6">
        <div className="flex items-center gap-1.5 mb-2">
          <Award size={14} className="text-purple-600" />
          <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">
            Academic Records
          </span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
          My Results
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-1 max-w-3xl leading-relaxed">
          Track real-time baseline completions and evaluate score metrics.
        </p>
      </header>

      {/* 2. MATCHED: SUBTLE CONTROL BAR & METRICS */}
      <div className="flex items-center gap-2 mb-2">
        <Layers size={14} className="text-purple-600" />
        <h2 className="text-xs font-black text-slate-700 uppercase tracking-widest">
          Performance History Engine
        </h2>
      </div>

      {/* 3. MATCHED: CARD GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {results.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 font-medium bg-white rounded-2xl border border-dashed border-slate-200 max-w-sm mx-auto w-full">
            <p className="italic text-xs font-bold uppercase tracking-wider">No verification tokens found.</p>
          </div>
        ) : (
          results.map(res => {
            const percentage = (res.score / res.total_questions) * 100;
            const threshold = res.pass_mark || 50;
            const isPassed = percentage >= threshold;

            return (
              <div 
                key={res.id} 
                className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-0.5 rounded-md border tracking-wider uppercase ${
                      isPassed ? 'bg-emerald-50 text-emerald-600 border-emerald-200/50' : 'bg-red-50 text-red-600 border-red-200/50'
                    }`}>
                      {isPassed ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                      {isPassed ? 'PASSED' : 'RETAKE'}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 tracking-widest">
                      {res.date}
                    </span>
                  </div>
                  
                  <h3 className="font-black text-lg text-slate-800 leading-snug">
                    {res.exam_title}
                  </h3>
                  
                  {/* Progress Rail */}
                  <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isPassed ? 'bg-emerald-500' : 'bg-red-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Achieved</span>
                    <span className="text-xs font-black text-slate-800">{percentage.toFixed(0)}%</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Req.</span>
                    <span className="text-xs font-black text-purple-700">{threshold}%</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}