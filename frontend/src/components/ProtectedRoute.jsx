import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ adminOnly = false }) {
  const auth = localStorage.getItem('auth');
  const isStaff = localStorage.getItem('isStaff') === 'true';

  // 1. If not logged in, send to Login
  if (!auth) {
    return <Navigate to="/" replace />;
  }

  // 2. If it's an admin page but user is just a student, send to exams
  if (adminOnly && !isStaff) {
    return <Navigate to="/exams" replace />;
  }

  // 3. Otherwise, show the content
  return <Outlet />;
}