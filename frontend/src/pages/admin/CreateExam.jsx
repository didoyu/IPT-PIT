import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Settings } from 'lucide-react';

export default function CreateExam() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [passMark, setPassMark] = useState(50);
  const navigate = useNavigate();
  const token = localStorage.getItem('auth');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/exams/', {
        title,
        description,
        pass_mark: passMark
      }, {
        headers: { Authorization: `Token ${token}` }
      });
      navigate(`/admin/add-question/${res.data.id}`);
    } catch (err) {
      alert("Error creating exam. Check if the server is running.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8">
      {/* WRAPPER INTEGRITY CONTAINER */}
      <div className="bg-gradient-to-br from-white via-white to-purple-50/30 p-8 rounded-[32px] border border-purple-100/60 shadow-md">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-purple-50 text-purple-700 rounded-xl border border-purple-100">
            <Settings size={18} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Setup New Exam</h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Exam Title Parameter</label>
            <input 
              className="w-full p-4 border border-slate-200 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none font-medium text-slate-800 transition-all text-sm"
              placeholder="e.g., CCNA: Subnetting Basics"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Academic Instructions & Manifesto</label>
            <textarea 
              className="w-full p-4 border border-slate-200 rounded-2xl h-32 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none font-medium text-slate-800 transition-all text-sm resize-none"
              placeholder="Describe what rules, bounds, and references the system user or student needs to fully map out..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* DYNAMIC CONSOLE SLIDER MODULE */}
          <div className="bg-purple-950/[0.02] p-6 rounded-2xl border border-purple-900/[0.05]">
            <div className="flex justify-between items-center mb-4">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">Passing Evaluation Threshold</label>
              <span className="bg-purple-700 text-white px-3 py-1 rounded-full font-black text-xs tracking-wide shadow-sm shadow-purple-100">
                {passMark}%
              </span>
            </div>
            <input 
              type="range"
              min="0"
              max="100"
              step="5"
              value={passMark}
              onChange={(e) => setPassMark(e.target.value)}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-700 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-3 font-medium italic">
              Candidate instances must hit this specific processing ceiling value to generate a verified "PASSED" response marker flag.
            </p>
          </div>

          <button 
            type="submit" 
            className="w-full bg-purple-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-600 transition shadow-lg shadow-purple-100 hover:shadow-purple-200 active:scale-[0.99] pt-4"
          >
            Create Engine Instance & Continue
          </button>
        </form>
      </div>
    </div>
  );
}