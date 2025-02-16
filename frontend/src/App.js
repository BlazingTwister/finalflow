import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

import StudentDashboard from "./pages/student/StudentDashboard";
import Messaging from "./pages/student/Messaging";
import Tasks from "./pages/student/Tasks";
import Scheduling from "./pages/student/Scheduling";

import LecturerDashboard from "./pages/lecturer/LecturerDashboard";

import Repository from "./pages/Repository"; 


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Student routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/messaging" element={<Messaging />} />
        <Route path="/student/tasks" element={<Tasks />} />
        <Route path="/student/schedule" element={<Scheduling />} />

        {/*Lecturer routes*/}
        <Route path="/lecturer/dashboard" element={<LecturerDashboard />} />

        <Route path="/repository" element={<Repository />} />

      </Routes>
    </Router>
  );
}

export default App;
