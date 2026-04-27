import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ActivateAccount from "./pages/ActivateAccount.jsx";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Student Pages
import ExamList from "./pages/student/ExamList";
import TakeExam from "./pages/student/TakeExam";
import StudentDashboard from "./pages/student/StudentDashboard";
import Profile from "./pages/Profile"; // ✅ ADDED

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateExam from "./pages/admin/CreateExam";
import AddQuestion from "./pages/admin/AddQuestion";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/activate/:uid/:token" element={<ActivateAccount />} />

        {/* ================= PROTECTED ROUTES ================= */}
        <Route element={<ProtectedRoute />}>

          <Route element={<MainLayout />}>

            {/* ---------- STUDENT ROUTES ---------- */}
            <Route path="/exams" element={<ExamList />} />
            <Route path="/take-exam/:id" element={<TakeExam />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/profile" element={<Profile />} /> {/* ✅ FIXED */}

            {/* ---------- ADMIN ROUTES ---------- */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/create-exam" element={<CreateExam />} />
              <Route path="/admin/add-question/:examId" element={<AddQuestion />} />
            </Route>

          </Route>
        </Route>

        {/* ================= 404 ================= */}
        <Route path="*" element={
          <div className="p-10 text-center text-xl font-bold">
            404: Page Not Found
          </div>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;