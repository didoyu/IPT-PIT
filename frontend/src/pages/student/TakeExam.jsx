import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function TakeExam() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();
  const token = localStorage.getItem('auth');

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/exams/${id}/`, {
      headers: { Authorization: `Token ${token}` }
    }).then(res => setExam(res.data));
  }, [id, token]);

  const handleCheckboxChange = (qId, optId) => {
    const currentSelections = answers[qId] || [];
    let newSelections;
    
    if (currentSelections.includes(optId)) {
      newSelections = currentSelections.filter(item => item !== optId);
    } else {
      newSelections = [...currentSelections, optId];
    }
    
    setAnswers({ ...answers, [qId]: newSelections });
  };

  const handleEssayChange = (qId, val) => {
    setAnswers({ ...answers, [qId]: val });
  };

  const submitExam = async () => {
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/submit-exam/', {
        exam_id: id, answers: answers
      }, { headers: { Authorization: `Token ${token}` } });
      
      alert(`Score: ${res.data.score}. Status: ${res.data.is_passed ? "PASSED" : "FAILED"}`);
      navigate('/dashboard');
    } catch (err) { alert("Submission failed. Ensure you have answered the questions."); }
  };

  if (!exam) return <div className="p-10 text-center">Loading Exam...</div>;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4 uppercase">{exam.title}</h1>
      <p className="text-slate-500 mb-8">{exam.description}</p>
      
      {exam.questions.map((q, index) => (
        <div key={q.id} className="mb-8 p-6 bg-white border rounded-2xl shadow-sm">
          <div className="flex justify-between mb-4">
            <p className="font-bold text-lg">Question {index + 1}</p>
            <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase">
              {q.question_type === 'MCQ' ? 'Select all that apply' : 'Essay'}
            </span>
          </div>
          <p className="text-slate-700 mb-6">{q.text}</p>
          
          {q.question_type === 'MCQ' ? (
            <div className="space-y-3">
              {q.options.map(opt => (
                <label key={opt.id} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                  (answers[q.id] || []).includes(opt.id) ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-slate-50'
                }`}>
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-indigo-600 mr-4"
                    checked={(answers[q.id] || []).includes(opt.id)}
                    onChange={() => handleCheckboxChange(q.id, opt.id)} 
                  />
                  <span className="font-medium text-slate-700">{opt.text}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea 
              className="w-full p-4 border rounded-xl h-40 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Provide a detailed explanation..."
              onChange={(e) => handleEssayChange(q.id, e.target.value)}
            />
          )}
        </div>
      ))}
      <button onClick={submitExam} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-indigo-700 transition">
        SUBMIT EXAMINATION
      </button>
    </div>
  );
}