import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ResultsTable from './ResultsTable';
import { Trash2, Shield, Layers, GraduationCap } from 'lucide-react'; 

export default function AdminDashboard() {
  const [exams, setExams] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const token = localStorage.getItem('auth');

  // Fetch exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get('https://ipt-pitbackend.onrender.com/api/exams/', {
          headers: { Authorization: `Token ${token}` }
        });
        setExams(res.data);
      } catch (err) {
        console.error("Failed to fetch exams");
      }
    };
    fetchExams();
  }, [token]);

  // Open modal
  const handleDeleteClick = (exam) => {
    setExamToDelete(exam);
    setShowDeleteModal(true);
  };

  // Confirm deletion
  const confirmDelete = async () => {
    try {
      await axios.delete(`https://ipt-pitbackend.onrender.com/api/exams/${examToDelete.id}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      setExams(exams.filter(e => e.id !== examToDelete.id));
      setShowDeleteModal(false);
      setExamToDelete(null);
    } catch (err) {
      alert("Error deleting exam.");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-12">
      
      {/* 🔮 DASHBOARD HEADER WITH DECORATIVE BACKGROUND CHIP */}
      <div className="flex justify-between items-end bg-gradient-to-r from-purple-50/50 to-transparent p-6 rounded-3xl border border-purple-100/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} className="text-purple-600" />
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Management Core</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Admin Panel</h1>
          <p className="text-slate-500 font-medium text-sm">Manage exams, questions, and view student performance.</p>
        </div>
        
        <Link 
          to="/admin/create-exam" 
          className="bg-purple-700 text-white px-6 py-3 rounded-xl font-black hover:bg-purple-600 transition-all shadow-lg shadow-purple-200 hover:shadow-purple-300 active:scale-[0.98]"
        >
          + CREATE EXAM
        </Link>
      </div>

      {/* EXAM MODULES GRID */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Layers size={16} className="text-purple-400" />
          <h2 className="text-xs font-black text-purple-400 uppercase tracking-widest">Active Exam Modules</h2>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            // ✨ ENHANCEMENT: Changed from bg-white to a rich multi-layered surface gradient 
            // Added card lift (hover:-translate-y-1) and a soft purple ambient shadow bloom
            <div 
              key={exam.id} 
              className="bg-gradient-to-br from-white via-white to-purple-50/40 p-6 rounded-3xl border border-purple-100/60 shadow-sm hover:shadow-xl hover:shadow-purple-100/60 hover:border-purple-300 hover:-translate-y-1 transition-all duration-300 group relative"
            >
              {/* DELETE ICON BUTTON */}
              <button 
                onClick={() => handleDeleteClick(exam)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-50 opacity-0 group-hover:opacity-100 hover:bg-red-50 text-red-500 transition-all z-10 shadow-sm"
              >
                <Trash2 size={16} />
              </button>

              {/* TOP COLOR TAG ACCENT STRIP */}
              <div className="w-12 h-1 bg-purple-600 rounded-full mb-4 group-hover:w-20 transition-all duration-300" />

              <h3 className="text-lg font-black text-slate-800 group-hover:text-purple-700 transition-colors">
                {exam.title}
              </h3>
              <p className="text-slate-500 text-sm mt-2 line-clamp-2 leading-relaxed min-h-[40px]">
                {exam.description}
              </p>
              
              {/* SLICK BOTTOM ACTION BADGE STRIP */}
              <div className="mt-6 flex justify-between items-center bg-purple-950/[0.02] border border-purple-900/[0.04] p-3 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                   Threshold: <span className="text-purple-700 font-bold">{exam.pass_mark}%</span>
                </span>
                
                <Link 
                  to={`/admin/add-question/${exam.id}`} 
                  className="text-purple-700 text-sm font-black hover:text-purple-500 px-3 py-1 transition-colors flex items-center gap-1"
                >
                  Manage <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RESULTS SECTION */}
      <section className="pt-8 border-t border-purple-100/60">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap size={18} className="text-slate-800" />
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Student Performance</h2>
            </div>
            <p className="text-slate-400 text-sm">Real-time scores and passing status of all exam attempts.</p>
          </div>
        </div>
        
        {/* Dynamic Table wrapper to add container premium lift */}
        <div className="bg-white rounded-3xl border border-purple-100/40 shadow-sm overflow-hidden p-2">
          <ResultsTable />
        </div>
      </section>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-purple-950/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-50 text-red-500 rounded-2xl">
                <Trash2 size={22} />
              </div>
              <h2 className="text-lg font-black text-slate-900">Confirm Deletion</h2>
            </div>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-800">{examToDelete?.title}</span>? This will permanently remove <strong>ALL questions and results</strong>.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors shadow-sm shadow-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}