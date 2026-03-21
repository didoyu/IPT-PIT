import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

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

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState(null);

  const token = localStorage.getItem('auth');
  const headers = { Authorization: `Token ${token}` };

  const fetchExamData = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/exams/${examId}/`, { headers });
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
        await axios.put(`http://127.0.0.1:8000/api/questions/${editingId}/`, { ...newQuestion, exam: examId }, { headers });
      } else {
        await axios.post(`http://127.0.0.1:8000/api/questions/`, { ...newQuestion, exam: examId }, { headers });
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

  // Open modal instead of direct delete
  const confirmDelete = (qId) => {
    setDeleteQuestionId(qId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://127.0.0.1:8000/api/questions/${deleteQuestionId}/`, { headers });
      setShowDeleteModal(false);
      setDeleteQuestionId(null);
      fetchExamData();
    } catch (err) {
      alert("Failed to delete question.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-black text-slate-800 mb-2 uppercase">Manage Exam Questions</h1>
      <p className="text-slate-500 mb-8 font-medium">Exam: <span className="text-indigo-600 underline">{examTitle}</span></p>

      {/* FORM */}
      <div className={`p-6 rounded-2xl border-2 mb-10 transition-all ${editingId ? 'border-indigo-500 bg-indigo-50/30' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h2 className="font-bold text-lg mb-4">{editingId ? '📝 Edit Question' : '➕ Add Question'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea 
            className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium" 
            placeholder="Enter question text..." 
            value={newQuestion.text}
            onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})} required
          />
          
          <select className="w-full p-3 border rounded-xl font-bold text-slate-600" value={newQuestion.question_type} onChange={(e) => setNewQuestion({...newQuestion, question_type: e.target.value})}>
            <option value="MCQ">Multiple Choice (Checkboxes)</option>
            <option value="ESSAY">Essay</option>
          </select>

          {newQuestion.question_type === 'MCQ' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {newQuestion.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3 bg-white p-3 border rounded-xl shadow-sm hover:border-indigo-200">
                  <input 
                    type="checkbox"
                    checked={opt.is_correct} 
                    onChange={() => {
                      const updated = [...newQuestion.options];
                      updated[i].is_correct = !updated[i].is_correct;
                      setNewQuestion({...newQuestion, options: updated});
                    }} 
                  />
                  <input className="flex-1 bg-transparent outline-none text-sm font-bold" placeholder={`Option ${i+1}`} value={opt.text}
                    onChange={(e) => {
                      const updated = [...newQuestion.options]; updated[i].text = e.target.value;
                      setNewQuestion({...newQuestion, options: updated});
                    }} required
                  />
                </div>
              ))}
            </div>
          ) : (
            <input className="w-full p-4 border rounded-xl" placeholder="Keywords for grading (e.g. Cisco, OSPF, VLAN)" value={newQuestion.required_keywords}
              onChange={(e) => setNewQuestion({...newQuestion, required_keywords: e.target.value})}
            />
          )}

          <div className="flex gap-3">
            <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black hover:bg-indigo-700 transition">
              {editingId ? 'UPDATE QUESTION' : 'SAVE QUESTION'}
            </button>
            {editingId && <button type="button" onClick={handleCancelEdit} className="px-6 py-3 bg-slate-200 text-slate-600 rounded-xl font-bold">CANCEL</button>}
          </div>
        </form>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        <h2 className="font-black text-slate-400 uppercase text-xs tracking-widest">Questions in Bank ({questions.length})</h2>
        {questions.map((q, i) => (
          <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center group">
            <div className="flex-1">
              <span className="text-[10px] font-black text-indigo-400 uppercase mb-1 block">{q.question_type}</span>
              <p className="font-bold text-slate-800">{i+1}. {q.text}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEditClick(q)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-black hover:bg-indigo-100">Edit</button>
              <button onClick={() => confirmDelete(q.id)} className="px-4 py-2 bg-red-50 text-red-500 rounded-lg text-xs font-black hover:bg-red-100">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Delete Question?</h3>
            <p className="text-slate-500 text-sm mb-6">Are you sure you want to delete this question? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded-xl bg-slate-200 text-slate-600 font-bold hover:bg-slate-300">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}