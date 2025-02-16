import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard"; 
import LecturerDashboard from "./pages/LecturerDashboard";
import Messaging from "./pages/Messaging";
import Tasks from "./pages/Tasks";
import Scheduling from "./pages/Scheduling";
import Repository from "./pages/Repository"; 


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/studentdashboard" element={<StudentDashboard />} />
        <Route path="/lecturerDashboard" element={<LecturerDashboard />} />
        <Route path="/messaging" element={<Messaging />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/schedule" element={<Scheduling />} />
        <Route path="/repository" element={<Repository />} />
      </Routes>
    </Router>
  );
}

export default App;
