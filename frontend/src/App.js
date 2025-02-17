import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Outlet } from "react-router-dom"; // Import Outlet
import Login from "./pages/Login";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentMessaging from "./pages/student/StudentMessaging";
import StudentTasks from "./pages/student/StudentTasks";
import StudentScheduling from "./pages/student/StudentScheduling";

import LecturerDashboard from "./pages/lecturer/LecturerDashboard";
import LecturerMessaging from "./pages/lecturer/LecturerMessaging";
import LecturerSchedule from "./pages/lecturer/LecturerSchedule";
import LecturerSubmissions from "./pages/lecturer/LecturerSubmissions";

import Repository from "./pages/Repository"; 
import Layout from "./components/Layout"; // Import Layout

const LayoutWrapper = () => (
  <Layout>
    <Outlet /> {/* This ensures child routes are rendered inside Layout */}
  </Layout>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Wrap student and lecturer routes in LayoutWrapper */}
        <Route element={<LayoutWrapper />}>
          {/* Student Routes */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/messaging" element={<StudentMessaging />} />
          <Route path="/student/tasks" element={<StudentTasks />} />
          <Route path="/student/schedule" element={<StudentScheduling />} />

          {/* Lecturer Routes */}
          <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />
          <Route path="/lecturer/messaging" element={<LecturerMessaging />} />
          <Route path="/lecturer/schedule" element={<LecturerSchedule />} />
          <Route path="/lecturer/submissions" element={<LecturerSubmissions/>} />

          {/* Repository */}
          <Route path="/repository" element={<Repository />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
