import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Compass, 
  ArrowRight, 
  Search, 
  SlidersHorizontal, 
  Layers, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';

export default function ExamList() {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem('auth');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await axios.get('https://ipt-pit-lgr4.onrender.com/api/exams/', {
          headers: { Authorization: `Token ${token}` }
        });
        setExams(res.data);
        setFilteredExams(res.data);
      } catch (err) {
        console.error("Error fetching exams:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [token]);

  useEffect(() => {
    const filtered = exams.filter(exam => 
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredExams(filtered);
  }, [searchQuery, exams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="text-center text-xs font-black text-purple-600 uppercase tracking-widest animate-pulse">
          Synchronizing Exam Registry...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen bg-slate-50">
      
      {/* 1. REFINED MINIMALIST HEADER */}
      <header className="border-b border-slate-200/60 pb-6">
        <div className="flex items-center gap-1.5 mb-2">
          <Compass size={14} className="text-purple-600" />
          <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">
            Student Portal Terminal
          </span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
          Available Modules
        </h1>
        <p className="text-slate-500 font-medium text-sm mt-1 max-w-3xl leading-relaxed">
          Select an active assessment node below. Ensure your environment matches parameters before launching execution blocks.
        </p>
      </header>

      {/* 2. SUBTLE CONTROL BAR & METRICS */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Search Bar Input */}
        <div className="flex-1 max-w-md bg-white border border-slate-200 rounded-xl p-2.5 flex items-center gap-2 shadow-sm focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-50 transition-all">
          <Search size={16} className="text-slate-400 ml-1" />
          <input 
            type="text"
            placeholder="Search modules..."
            className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none placeholder:text-slate-400 placeholder:uppercase tracking-wider"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Flat Minimalist Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
            <Layers size={14} className="text-purple-600" />
            <span className="text-xs font-black text-slate-700">{exams.length} TOTAL</span>
          </div>

          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span className="text-xs font-black text-slate-700">ACTIVE READY</span>
          </div>
        </div>
      </div>

      {/* 3. CARD GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {filteredExams.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 font-medium bg-white rounded-2xl border border-dashed border-slate-200 max-w-sm mx-auto w-full">
            <BookOpen size={24} className="mx-auto text-slate-300 mb-2" />
            <p className="italic text-xs font-bold uppercase tracking-wider">No matching modules found</p>
          </div>
        ) : (
          filteredExams.map(exam => (
            <div 
              key={exam.id} 
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="inline-flex items-center gap-1 text-[9px] font-black px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/40 tracking-wider uppercase">
                    ONLINE BLOCK
                  </span>
                  <span className="text-[10px] font-black text-slate-400 tracking-widest">
                    ID: #{exam.id}
                  </span>
                </div>
                
                <h3 className="font-black text-lg text-slate-800 group-hover:text-purple-700 transition-colors leading-snug">
                  {exam.title}
                </h3>
                <p className="text-slate-500 text-sm mt-1.5 line-clamp-3 leading-relaxed min-h-[60px]">
                  {exam.description || "No supplemental descriptor context profile provided for this baseline framework track module."}
                </p>
              </div>
              
              {/* Card Footer Action Block */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Target Pass</span>
                  <span className="text-xs font-black text-purple-700">{exam.pass_mark}% Score</span>
                </div>
                
                <Link 
                  to={`/take-exam/${exam.id}`} 
                  className="bg-purple-50 text-purple-700 border border-purple-100 px-4 py-2 rounded-xl text-xs font-black hover:bg-purple-700 hover:text-white transition-all duration-150 flex items-center gap-1"
                >
                  START <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}