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
    // 💜 THEME UPDATE: Migrated from bg-indigo-700 to bg-purple-700
    <header className="bg-purple-700 text-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-extrabold tracking-tight">ONLINE EXAMINATION</h1>
        {isStaff && (
          <span className="bg-red-500 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider">
            ADMIN
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm opacity-90">
          Welcome, <strong>{user}</strong>
        </span>

        {/* 💜 BUTTON SYNC: Updated to matches purple-600 interactive variants */}
        <button 
          onClick={() => navigate('/profile')}
          className="bg-purple-600 hover:bg-purple-500 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors shadow-sm active:scale-[0.98]"
        >
          Profile
        </button>

        {/* 💜 BUTTON SYNC: Adjusted logout to build dark-purple depth contrast */}
        <button 
          onClick={handleLogout}
          className="bg-purple-800 hover:bg-purple-900 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors shadow-sm active:scale-[0.98]"
        >
          Logout
        </button>
      </div>
    </header>
  );
}