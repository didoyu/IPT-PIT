import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import Chatbot from "../components/Chatbot"; 

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const username = localStorage.getItem('user') || 'Student';
  const isStaff = localStorage.getItem('isStaff') === 'true';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* 🔮 NAVBAR / HEADER */}
      {/* Changed to bg-purple-950 to match the login base, paired with a subtle deep border */}
      <nav className="bg-purple-950 border-b border-purple-900 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-md text-white">

        {/* LEFT SIDE: BRANDING & NAVIGATION LINKS */}
        <div className="flex items-center gap-8">
          <Link
            to={isStaff ? "/admin" : "/exams"}
            className="text-xl font-black text-white tracking-tight"
          >
            EXAM<span className="text-purple-400">SYS</span>
          </Link>

          {/* NAV LINKS WITH ADJUSTED CONTRAST */}
          <div className="hidden md:flex gap-6 text-sm font-semibold text-purple-200/80">
            {isStaff ? (
              <>
                <Link
                  to="/admin"
                  className={`transition-colors py-1 ${
                    isActive("/admin")
                      ? "text-white border-b-2 border-white"
                      : "hover:text-white"
                  }`}
                >
                  Management
                </Link>

                <Link
                  to="/admin/create-exam"
                  className={`transition-colors py-1 ${
                    isActive("/admin/create-exam")
                      ? "text-white border-b-2 border-white"
                      : "hover:text-white"
                  }`}
                >
                  Create Exam
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/exams"
                  className={`transition-colors py-1 ${
                    isActive("/exams")
                      ? "text-white border-b-2 border-white"
                      : "hover:text-white"
                  }`}
                >
                  Available Exams
                </Link>

                <Link
                  to="/dashboard"
                  className={`transition-colors py-1 ${
                    isActive("/dashboard")
                      ? "text-white border-b-2 border-white"
                      : "hover:text-white"
                  }`}
                >
                  My Results
                </Link>
              </>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: USER PROFILE & CONTROLS */}
        <div className="flex items-center gap-4">

          {/* USER DISPLAY */}
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
              Logged in as
            </p>
            <p className="text-sm font-bold text-white">
              {username}
            </p>
          </div>

          {/* PROFILE ACTION BUTTON */}
          <button
            onClick={() => navigate('/profile')}
            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm active:scale-[0.98]"
          >
            Profile
          </button>

          {/* LOGOUT BUTTON - Styled beautifully for dark backgrounds */}
          <button
            onClick={handleLogout}
            className="bg-purple-900/60 hover:bg-red-600 text-purple-200 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-purple-800/80 active:scale-[0.98]"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="py-8">
        <Outlet />
      </main>

      {/* Floating Global Chatbot Widget */}
      <Chatbot />
    </div>
  );
}