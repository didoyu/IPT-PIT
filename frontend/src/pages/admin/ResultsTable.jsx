import { useEffect, useState } from 'react';
import axios from 'axios';
import { Filter, Award } from 'lucide-react';

export default function ResultsTable() {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [sections, setSections] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('auth');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get('https://ipt-pitbackend.onrender.com/api/admin-results/', {
          headers: { Authorization: `Token ${token}` }
        });
        setResults(res.data);
        setFilteredResults(res.data);
      } catch (err) {
        console.error("Error fetching results", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [token]);

  useEffect(() => {
    if (!results || results.length === 0) return;

    const uniqueSections = [
      ...new Set(
        results
          .map(r => r.section)
          .filter(sec => sec && sec.toLowerCase() !== 'n/a')
      )
    ];

    const uniqueYears = [
      ...new Set(
        results
          .map(r => r.school_year)
          .filter(yr => yr && yr.toLowerCase() !== 'n/a')
      )
    ];

    setSections(uniqueSections);
    setYears(uniqueYears);
  }, [results]);

  useEffect(() => {
    if (!results || results.length === 0) return;

    const filtered = results.filter((r) => {
      const matchSection = selectedSection
        ? r.section?.trim() === selectedSection.trim()
        : true;

      const matchYear = selectedYear
        ? r.school_year?.trim() === selectedYear.trim()
        : true;

      return matchSection && matchYear;
    });

    setFilteredResults(filtered);
  }, [selectedSection, selectedYear, results]);

  if (loading) return <div className="p-10 text-center text-sm font-black text-purple-400 uppercase tracking-widest animate-pulse">Streaming data streams...</div>;

  return (
    <div className="p-2 bg-white rounded-3xl mt-2">
      
      {/* CONTROL SHIELD FILTER BAR */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-black uppercase tracking-wider mr-2">
          <Filter size={14} className="text-purple-500" />
          <span>Sort Matrix:</span>
        </div>
        
        <select
          className="p-2 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-purple-400 transition-all cursor-pointer"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
        >
          <option value="">All Section Channels</option>
          {sections.map((sec) => (
            <option key={sec} value={sec}>{sec}</option>
          ))}
        </select>

        <select
          className="p-2 px-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-purple-400 transition-all cursor-pointer"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="">All Academic Years</option>
          {years.map((yr) => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>
      </div>

      {/* CORE MATRIX INTERFACE */}
      <div className="overflow-x-auto rounded-2xl border border-purple-100/30">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-purple-950/[0.02] border-b border-purple-100/60 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <th className="py-4 px-5">Student Identity</th>
              <th className="py-4 px-4">Section</th>
              <th className="py-4 px-4">School Year</th>
              <th className="py-4 px-4">Exam Module Target</th>
              <th className="py-4 px-4 text-center">Raw Score</th>
              <th className="py-4 px-4 text-center">Status Flag</th>
              <th className="py-4 px-5 text-right">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-100/30 text-sm font-medium text-slate-700">
            {filteredResults.map((res) => {
              const percentage = (res.score / res.total_questions) * 100;
              // Sync logic to look at manual evaluation marks if present, default to 50
              const currentThreshold = res.pass_mark !== undefined ? res.pass_mark : 50;
              const isPassed = percentage >= currentThreshold;

              return (
                <tr key={res.id} className="hover:bg-purple-50/30 transition-colors duration-150">
                  <td className="py-4 px-5 font-bold text-slate-900">{res.student_name}</td>
                  <td className="py-4 px-4 text-slate-600 text-xs font-bold">{res.section}</td>
                  <td className="py-4 px-4 text-slate-500 text-xs">{res.school_year}</td>
                  <td className="py-4 px-4 text-slate-700 font-semibold">{res.exam_title}</td>
                  <td className="py-4 px-4 text-center font-black text-purple-700 text-sm">
                    {res.score} <span className="text-slate-300 font-normal text-xs">/</span> {res.total_questions}
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-wide border ${
                      isPassed 
                        ? 'bg-green-50 text-green-700 border-green-200/60' 
                        : 'bg-red-50 text-red-600 border-red-200/60'
                    }`}>
                      {isPassed && <Award size={10} />}
                      {isPassed ? 'PASSED' : 'FAILED'}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right text-slate-400 text-xs">{res.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredResults.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs font-medium italic bg-slate-50/50">
            No active exam result sequences match the selected sort metrics.
          </div>
        )}
      </div>
    </div>
  );
}