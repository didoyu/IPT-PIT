import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { HelpCircle, Trash2, Edit2, CornerDownRight } from 'lucide-react';

export default function AddQuestion() {
  const { examId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [examTitle, setExamTitle] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    question_type: 'MCQ',
    required_keywords: '',
    options: [
      { text: '', is_correct: false }, { text: '', is_correct: false },
      { text: '', is_correct: false }, { text: '', is_correct: false },
    ]
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState(null);

  const token = localStorage.getItem('auth');
  const headers = { Authorization: `Token ${token}` };

  const fetchExamData = async () => {
    try {
      const res = await axios.get(`https://ipt-pitbackend.onrender.com/api/exams/${examId}/`, { headers });
      setQuestions(res.data.questions);
      setExamTitle(res.data.title);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchExamData(); }, [examId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newQuestion.question_type === 'MCQ' && !newQuestion.options.some(opt => opt.is_correct)) {
      alert("Please mark at least one correct answer!"); return;
    }

    try {
      if (editingId) {
        await axios.put(`https://ipt-pitbackend.onrender.com/api/questions/${editingId}/`, { ...newQuestion, exam: examId }, { headers });
      } else {
        await axios.post(`https://ipt-pitbackend.onrender.com/api/questions/`, { ...newQuestion, exam: examId }, { headers });
      }
      handleCancelEdit();
      fetchExamData();
    } catch (err) { alert("Error saving question."); }
  };

  const handleEditClick = (q) => {
    setEditingId(q.id);
    setNewQuestion({
      text: q.text,
      question_type: q.question_type || 'MCQ',
      required_keywords: q.required_keywords || '',
      options: q.options && q.options.length > 0 ? q.options : [
        { text: '', is_correct: false }, { text: '', is_correct: false },
        { text: '', is_correct: false }, { text: '', is_correct: false },
      ]
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewQuestion({
      text: '', question_type: 'MCQ', required_keywords: '',
      options: [{ text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }]
    });
  };

  const confirmDelete = (qId) => {
    setDeleteQuestionId(qId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://ipt-pitbackend.onrender.com/api/questions/${deleteQuestionId}/`, { headers });
      setShowDeleteModal(false);
      setDeleteQuestionId(null);
      fetchExamData();
    } catch (err) { alert("Failed to delete question."); }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 mb-1 uppercase tracking-tight">Manage Exam Questions</h1>
        <p className="text-slate-500 font-medium text-sm flex items-center gap-1.5">
          Exam Configuration: <span className="text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-100">{examTitle}</span>
        </p>
      </div>

      {/* COMPONENT FORM WORKSPACE */}
      <div className={`p-6 rounded-3xl border transition-all duration-300 ${editingId ? 'border-purple-500 bg-gradient-to-br from-purple-50/40 via-white to-purple-50/10 shadow-lg shadow-purple-100/50' : 'bg-white border-purple-100/60 shadow-sm'}`}>
        <h2 className="font-black text-slate-800 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
          {editingId ? <Edit2 size={16} className="text-purple-600" /> : <HelpCircle size={18} className="text-purple-600" />}
          {editingId ? 'Edit Question Formulation' : 'Create New Question'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <textarea 
            className="w-full p-4 border border-slate-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none font-medium transition-all resize-none text-slate-800" 
            rows="3"
            placeholder="Enter question wording clearly..." 
            value={newQuestion.text}
            onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})} required
          />
          
          <div className="w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Evaluation Mechanics Type</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-purple-400 focus:bg-white transition-all cursor-pointer text-sm" 
              value={newQuestion.question_type} 
              onChange={(e) => setNewQuestion({...newQuestion, question_type: e.target.value})}
            >
              <option value="MCQ">Multiple Choice Questionnaire (MCQ)</option>
              <option value="ESSAY">Analytical Essay Response</option>
            </select>
          </div>

          {newQuestion.question_type === 'MCQ' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {newQuestion.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3 bg-white p-3.5 border border-slate-100 rounded-2xl shadow-inner-sm hover:border-purple-300 transition-all group">
                  <input 
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-purple-700 focus:ring-purple-500 accent-purple-700 cursor-pointer"
                    checked={opt.is_correct} 
                    onChange={() => {
                      const updated = [...newQuestion.options];
                      updated[i].is_correct = !updated[i].is_correct;
                      setNewQuestion({...newQuestion, options: updated});
                    }} 
                  />
                  <input 
                    className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-800 placeholder-slate-400" 
                    placeholder={`Option alternative ${i+1}`} 
                    value={opt.text}
                    onChange={(e) => {
                      const updated = [...newQuestion.options]; updated[i].text = e.target.value;
                      setNewQuestion({...newQuestion, options: updated});
                    }} required
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="pt-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">Automated Keyword Dictionary Matrix</label>
              <input 
                className="w-full p-4 border border-slate-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none text-sm font-medium transition-all" 
                placeholder="Required keywords string matching rules (e.g., OSPF, backbone, area 0)" 
                value={newQuestion.required_keywords}
                onChange={(e) => setNewQuestion({...newQuestion, required_keywords: e.target.value})}
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button 
              type="submit" 
              className="flex-1 bg-purple-700 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-purple-600 transition shadow-md shadow-purple-100 active:scale-[0.99]"
            >
              {editingId ? 'Update Engine Configuration' : 'Commit to Question Bank'}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={handleCancelEdit} 
                className="px-6 py-3.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-slate-200 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* DATA STRUCT BANK VIEW */}
      <div className="space-y-4">
        <h2 className="font-black text-purple-400 uppercase text-xs tracking-widest flex items-center gap-2">
          <CornerDownRight size={14} /> Questions inside storage ledger ({questions.length})
        </h2>
        
        <div className="space-y-3">
          {questions.map((q, i) => (
            <div key={q.id} className="bg-gradient-to-br from-white to-purple-50/20 p-5 rounded-2xl border border-purple-100/50 shadow-sm flex justify-between items-center group hover:border-purple-300 hover:shadow-md transition-all duration-200">
              <div className="flex-1 pr-4">
                <span className="text-[9px] font-black bg-purple-100/60 text-purple-700 border border-purple-200/40 px-2 py-0.5 rounded-md uppercase mb-2 inline-block tracking-wider">
                  {q.question_type}
                </span>
                <p className="font-bold text-slate-800 text-sm leading-relaxed">{i+1}. {q.text}</p>
              </div>
              <div className="flex gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEditClick(q)} 
                  className="px-3.5 py-2 bg-purple-50 text-purple-700 rounded-xl text-xs font-black border border-purple-100/40 hover:bg-purple-100 transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={() => confirmDelete(q.id)} 
                  className="px-3.5 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-black border border-red-100/40 hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {questions.length === 0 && (
            <p className="text-center text-slate-400 text-sm italic py-6 border border-dashed border-slate-200 rounded-2xl bg-white">No active configuration objects added yet.</p>
          )}
        </div>
      </div>

      {/* CORE MODAL ACCENT ALIGNMENT */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-purple-950/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-7 max-w-sm w-full shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Purge Configuration?</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">Are you certain you want to destroy this item sequence? This cascade cannot be recovered.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 text-sm transition-colors">Cancel</button>
              <button onClick={handleDelete} className="px-5 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 text-sm shadow-sm shadow-red-100 transition-colors">Confirm Purge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}