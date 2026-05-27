import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Check, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';

export default function TakeExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('auth');

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyTaken, setAlreadyTaken] = useState(false);

  const [modal, setModal] = useState({
    show: false,
    passed: false,
    score: 0,
    message: "",
    detail: ""
  });

  // ✅ LOAD EXAM + CHECK ATTEMPT
  useEffect(() => {
    if (!token) return;

    // Load exam data
    axios.get(`https://ipt-pit-lgr4.onrender.com/api/exams/${id}/`, {
      headers: { Authorization: `Token ${token}` }
    })
    .then(res => setExam(res.data))
    .catch(err => console.error("Could not load exam data:", err));

    // Check if already taken
    axios.get(`https://ipt-pit-lgr4.onrender.com/api/exams/${id}/taken/`, {
      headers: { Authorization: `Token ${token}` }
    })
    .then(res => {
      if (res.data?.taken) {
        setAlreadyTaken(true);
        setModal({
          show: true,
          passed: false,
          score: 0,
          message: "ALREADY TAKEN",
          detail: "You have already completed this exam module. Redirecting to performance history is recommended."
        });
      }
    })
    .catch(err => console.error("Error checking attempt matrix:", err));
  }, [id, token]);

  // ✅ HANDLERS
  const handleCheckboxChange = (qId, optId) => {
    const currentSelections = answers[qId] || [];
    const newSelections = currentSelections.includes(optId)
      ? currentSelections.filter(item => item !== optId)
      : [...currentSelections, optId];

    setAnswers({ ...answers, [qId]: newSelections });
  };

  const handleEssayChange = (qId, val) => {
    setAnswers({ ...answers, [qId]: val });
  };

  // ✅ SUBMIT EXAM
  const submitExam = async () => {
    if (alreadyTaken) return;

    // Safely check questions length with optional chaining or fallback
    const questionsList = exam?.questions || exam?.question_set || [];
    
    if (questionsList.length === 0 || Object.keys(answers).length < questionsList.length) {
      setModal({
        show: true,
        passed: false,
        score: 0,
        message: "INCOMPLETE",
        detail: "Please answer all active question fields before executing a submission build."
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.post(
        'https://ipt-pit-lgr4.onrender.com/api/submit-exam/',
        { exam_id: id, answers: answers },
        { headers: { Authorization: `Token ${token}` } }
      );

      setModal({
        show: true,
        passed: res.data.is_passed,
        score: res.data.score,
        message: res.data.is_passed ? "CONGRATULATIONS!" : "EFFORT ACKNOWLEDGED",
        detail: res.data.is_passed
          ? "You have successfully cleared this module target."
          : "Your score did not meet the required threshold parameters this cycle."
      });

      setAlreadyTaken(true);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Network error code verification failure.";
      setModal({
        show: true,
        passed: false,
        score: 0,
        message: "SUBMIT ERROR",
        detail: errorMsg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!exam) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center gap-3">
        <Loader2 className="animate-spin text-purple-600" size={24} />
        <div className="text-center text-xs font-black text-purple-600 uppercase tracking-widest">
          Loading Exam Content...
        </div>
      </div>
    );
  }

  // Fallback map check to read both 'questions' or standard Django 'question_set'
  const activeQuestions = exam.questions || exam.question_set || [];

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-8 min-h-screen space-y-10">
      
      {/* HEADER STRIP */}
      <header className="space-y-2">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 text-[10px] font-black text-purple-600 uppercase tracking-widest hover:text-purple-700 transition"
        >
          <ArrowLeft size={12} /> Back to Dashboard
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-1">
            {exam.title}
          </h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">{exam.description}</p>
        </div>
      </header>

      {/* QUESTIONS CONTAINER */}
      <div className="space-y-6">
        {activeQuestions.length === 0 ? (
          <p className="text-slate-400 italic text-sm p-6 bg-white border rounded-3xl text-center">
            No questions are assigned to this exam configuration payload.
          </p>
        ) : (
          activeQuestions.map((q, index) => (
            <div key={q.id} className="p-6 bg-white border border-purple-100/40 rounded-[24px] shadow-sm relative">
              <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Question {index + 1}
                </span>
                <span className="text-[9px] font-black bg-purple-50 text-purple-700 border border-purple-200/30 px-2.5 py-0.5 rounded-md uppercase tracking-widest">
                  {q.question_type === 'MCQ' ? 'MCQ' : 'ESSAY'}
                </span>
              </div>

              <p className="font-bold text-slate-800 text-base mb-4 leading-relaxed">{q.text}</p>

              {q.question_type === 'MCQ' ? (
                <div className="grid gap-2">
                  {(q.options || []).map(opt => {
                    const isChecked = (answers[q.id] || []).includes(opt.id);
                    return (
                      <label 
                        key={opt.id} 
                        className={`flex items-center gap-3 p-3 rounded-xl border text-sm font-bold text-slate-700 transition-all cursor-pointer ${
                          isChecked 
                            ? 'border-purple-600 bg-purple-50/40 text-purple-900' 
                            : 'border-slate-100 bg-slate-50/50 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-purple-700 focus:ring-purple-500 accent-purple-700"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(q.id, opt.id)}
                        />
                        <span>{opt.text}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <textarea
                  className="w-full border border-slate-200 p-4 rounded-xl h-32 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none font-medium text-sm text-slate-800 transition-all resize-none"
                  placeholder="Type your comprehensive essay answer response here..."
                  value={answers[q.id] || ''}
                  onChange={(e) => handleEssayChange(q.id, e.target.value)}
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* ACTION ACCENT BUTTON */}
      <button
        onClick={submitExam}
        disabled={isSubmitting || alreadyTaken}
        className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 ${
          isSubmitting || alreadyTaken
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-purple-700 text-white hover:bg-purple-600 shadow-md shadow-purple-100 active:scale-[0.995]'
        }`}
      >
        {alreadyTaken
          ? "ALREADY COMMITTED"
          : isSubmitting
          ? "TRANSMITTING DATA..."
          : "SUBMIT COMPLETED EXAM"}
      </button>

      {/* PREMIUM GLASS MODAL */}
      {modal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[28px] p-8 text-center max-w-sm w-full border border-purple-100 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className={`mx-auto p-3.5 w-12 h-12 rounded-xl mb-4 flex items-center justify-center border ${
              modal.message.includes("CONGRATULATIONS")
                ? 'bg-green-50 text-green-600 border-green-100'
                : modal.message.includes("INCOMPLETE")
                ? 'bg-amber-50 text-amber-600 border-amber-100'
                : 'bg-red-50 text-red-500 border-red-100'
            }`}>
              {modal.message.includes("CONGRATULATIONS") ? <Check size={24} /> : <ShieldAlert size={24} />}
            </div>

            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-2">{modal.message}</h2>

            <div className="text-slate-500 text-sm font-medium mb-6 space-y-2">
              {/* Fixes the '0' render logical evaluation leak */}
              {modal.score !== undefined && modal.score !== null && (
                <p className="text-base font-black text-purple-700 bg-purple-50/60 py-1 rounded-lg border border-purple-100/50 max-w-[120px] mx-auto mb-2">
                  Score: {modal.score} Pts
                </p>
              )}
              <p className="leading-relaxed">{modal.detail}</p>
            </div>

            <button
              onClick={() => {
                if (modal.message === "INCOMPLETE") {
                  setModal(prev => ({ ...prev, show: false }));
                } else {
                  navigate('/dashboard');
                }
              }}
              className="w-full bg-slate-900 text-white px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition"
            >
              {modal.message === "INCOMPLETE" ? "Dismiss Warning" : "Back to Dashboard"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}