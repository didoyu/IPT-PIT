import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function StudentDashboard() {
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const token = localStorage.getItem('auth');

  useEffect(() => {
    const fetchData = async () => {
      const headers = { Authorization: `Token ${token}` };
      try {
        const [examRes, resultRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/exams/', { headers }),
          axios.get('http://127.0.0.1:8000/api/student-results/', { headers })
        ]);
        setExams(examRes.data);
        setResults(resultRes.data);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      }
    };
    fetchData();
  }, [token]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12 bg-slate-50 min-h-screen">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Student Hub</h1>
        <p className="text-slate-500 font-medium">Track your certifications and upcoming assessments.</p>
      </header>

      {/* --- AVAILABLE MODULES --- */}
      <section>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Open Examinations</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {exams.map(exam => (
            <div key={exam.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all group">
              <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">{exam.title}</h3>
              <p className="text-slate-500 text-xs mt-2 line-clamp-2">{exam.description}</p>
              <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[10px] font-black text-indigo-500 uppercase">Target: {exam.pass_mark}%</span>
                <Link 
                  to={`/take-exam/${exam.id}`} 
                  className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-black hover:bg-indigo-600 hover:text-white transition"
                >
                  START →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- PERFORMANCE RECORDS --- */}
      <section>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Your Performance History</h2>
        <div className="grid gap-4">
          {results.length === 0 && <p className="text-slate-300 italic text-sm">No exam attempts recorded yet.</p>}
          {results.map(res => {
            const percentage = (res.score / res.total_questions) * 100;
            const threshold = res.pass_mark || 50; // Falls back to 50 if pass_mark is not in the result object
            const isPassed = percentage >= threshold;

            return (
              <div key={res.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{res.exam_title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{res.date}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                      isPassed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {isPassed ? 'MODULE COMPLETED' : 'RETAKE REQUIRED'}
                    </span>
                    <p className="text-sm font-black text-slate-700 mt-2">{res.score} / {res.total_questions} Points</p>
                  </div>
                </div>

                {/* DYNAMIC PROGRESS BAR */}
                <div className="relative w-full bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-50">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${isPassed ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-red-500'}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-slate-400 font-black">ACHIEVED: {percentage.toFixed(0)}%</span>
                  <span className="text-[10px] text-indigo-500 font-black uppercase italic">REQUIRED: {threshold}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}