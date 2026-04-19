import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const user = localStorage.getItem('user') || 'Guest';
  const isStaff = localStorage.getItem('isStaff') === 'true';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <header className="bg-indigo-700 text-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-extrabold tracking-tight">ONLINE EXAMINATION</h1>
        {isStaff && (
          <span className="bg-red-500 text-[10px] px-2 py-0.5 rounded-full">
            ADMIN
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm opacity-90">
          Welcome, <strong>{user}</strong>
        </span>

        {/* ✅ NEW PROFILE BUTTON */}
        <button 
          onClick={() => navigate('/profile')}
          className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded text-sm transition"
        >
          Profile
        </button>

        <button 
          onClick={handleLogout}
          className="bg-indigo-800 hover:bg-indigo-900 px-3 py-1 rounded text-sm transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
}