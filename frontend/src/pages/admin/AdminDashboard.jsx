import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ResultsTable from './ResultsTable';
import { Trash2 } from 'lucide-react'; // Trash icon

export default function AdminDashboard() {
  const [exams, setExams] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  const token = localStorage.getItem('auth');

  // Fetch exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:8000/api/exams/', {
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
      await axios.delete(`http://127.0.0.1:8000/api/exams/${examToDelete.id}/`, {
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
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Admin Panel</h1>
          <p className="text-slate-500 font-medium">Manage exams, questions, and view student performance.</p>
        </div>
        <Link 
          to="/admin/create-exam" 
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-100"
        >
          + CREATE EXAM
        </Link>
      </div>

      {/* EXAM MODULES GRID */}
      <section>
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Active Exam Modules</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <div key={exam.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition group relative">
              {/* DELETE ICON */}
              <button 
                onClick={() => handleDeleteClick(exam)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-100 text-red-500 transition"
              >
                <Trash2 size={18} />
              </button>

              <h3 className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{exam.title}</h3>
              <p className="text-slate-500 text-sm mt-2 line-clamp-2 leading-relaxed">{exam.description}</p>
              
              <div className="mt-6 flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                <span className="text-[10px] font-black text-slate-400 uppercase">
                   Threshold: <span className="text-slate-900">{exam.pass_mark}%</span>
                </span>
                <Link 
                  to={`/admin/add-question/${exam.id}`} 
                  className="text-indigo-600 text-sm font-black hover:bg-white px-3 py-1 rounded-lg transition shadow-sm"
                >
                  Manage →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RESULTS SECTION */}
      <section className="pt-8 border-t border-slate-100">
        <div className="mb-6">
          <h2 className="text-xl font-black text-slate-900 uppercase">Student Performance</h2>
          <p className="text-slate-400 text-sm">Real-time scores and passing status of all exam attempts.</p>
        </div>
        <ResultsTable />
      </section>

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 size={24} className="text-red-500" />
              <h2 className="text-lg font-black text-slate-900">Confirm Deletion</h2>
            </div>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete <span className="font-bold">{examToDelete?.title}</span>? This will remove <strong>ALL questions and results</strong>.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-300 transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition"
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