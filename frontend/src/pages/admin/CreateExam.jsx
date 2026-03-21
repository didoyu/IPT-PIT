import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CreateExam() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passMark, setPassMark] = useState(50); // State to handle the threshold
  const navigate = useNavigate();
  const token = localStorage.getItem('auth');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/exams/', {
        title,
        description,
        pass_mark: passMark // Sending the manual threshold to Django
      }, {
        headers: { Authorization: `Token ${token}` }
      });
      // Redirect to add questions for the new exam
      navigate(`/admin/add-question/${res.data.id}`);
    } catch (err) {
      alert("Error creating exam. Check if the server is running.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-black text-slate-800 mb-6 uppercase tracking-tight">Setup New Exam</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2">Exam Title</label>
            <input 
              className="w-full p-4 border rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              placeholder="e.g., CCNA: Subnetting Basics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2">Instructions</label>
            <textarea 
              className="w-full p-4 border rounded-2xl h-32 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              placeholder="Describe what the student needs to know..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* --- MANUAL THRESHOLD SETTING --- */}
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-bold text-slate-700 uppercase">Passing Threshold</label>
              <span className="bg-indigo-600 text-white px-3 py-1 rounded-full font-black text-sm">{passMark}%</span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              step="5"
              value={passMark}
              onChange={(e) => setPassMark(e.target.value)}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <p className="text-[10px] text-slate-400 mt-3 italic">
              Students must reach this percentage to be marked as "PASSED."
            </p>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 uppercase tracking-widest"
          >
            Create & Continue
          </button>
        </form>
      </div>
    </div>
  );
}