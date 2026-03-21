import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function ExamList() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const auth = localStorage.getItem('auth');
    axios.get('http://127.0.0.1:8000/api/exams/', {
      headers: { 'Authorization': `Basic ${auth}` }
    }).then(res => setExams(res.data));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Available Exams</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exams.map(exam => (
          <div key={exam.id} className="border p-6 rounded-lg shadow hover:shadow-lg transition">
            <h2 className="text-xl font-semibold">{exam.title}</h2>
            <p className="text-gray-600 my-2">{exam.description}</p>
            <Link to={`/take-exam/${exam.id}`} 
                  className="mt-4 inline-block bg-green-600 text-white px-4 py-2 rounded">
              Start Exam
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}