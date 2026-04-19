import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const username = localStorage.getItem('user');
  const isStaff = localStorage.getItem('isStaff') === 'true';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Highlight active link
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* NAVBAR / HEADER */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-8">
          <Link
            to={isStaff ? "/admin" : "/exams"}
            className="text-xl font-black text-indigo-600 tracking-tight"
          >
            EXAM<span className="text-slate-900">SYS</span>
          </Link>

          {/* NAV LINKS */}
          <div className="hidden md:flex gap-6 text-sm font-semibold text-slate-600">
            {isStaff ? (
              <>
                <Link
                  to="/admin"
                  className={`transition ${
                    isActive("/admin")
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "hover:text-indigo-600"
                  }`}
                >
                  Management
                </Link>

                <Link
                  to="/admin/create-exam"
                  className={`transition ${
                    isActive("/admin/create-exam")
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "hover:text-indigo-600"
                  }`}
                >
                  Create Exam
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/exams"
                  className={`transition ${
                    isActive("/exams")
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "hover:text-indigo-600"
                  }`}
                >
                  Available Exams
                </Link>

                <Link
                  to="/dashboard"
                  className={`transition ${
                    isActive("/dashboard")
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "hover:text-indigo-600"
                  }`}
                >
                  My Results
                </Link>
              </>
            )}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          {/* USER INFO */}
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400 font-bold uppercase">
              Logged in as
            </p>
            <p className="text-sm font-bold text-slate-900">
              {username}
            </p>
          </div>

          {/* ✅ PROFILE BUTTON */}
          <button
            onClick={() => navigate('/profile')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            Profile
          </button>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <main className="py-8">
        <Outlet />
      </main>
    </div>
  );
}