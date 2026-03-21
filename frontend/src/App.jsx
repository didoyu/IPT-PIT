import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login"; 
import Register from "./pages/Register";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Student Pages
import ExamList from "./pages/student/ExamList";
import TakeExam from "./pages/student/TakeExam";
import StudentDashboard from "./pages/student/StudentDashboard";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateExam from "./pages/admin/CreateExam";
import AddQuestion from "./pages/admin/AddQuestion";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            
            {/* Student Routes */}
            <Route path="/exams" element={<ExamList />} />
            <Route path="/take-exam/:id" element={<TakeExam />} />
            <Route path="/dashboard" element={<StudentDashboard />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute adminOnly={true} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/create-exam" element={<CreateExam />} />
              <Route path="/admin/add-question/:examId" element={<AddQuestion />} />
            </Route>

          </Route>
        </Route>

        <Route path="*" element={<div className="p-10 text-center">404: Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;