import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Outlet } from "react-router-dom"; // Import Outlet
import Login from "./pages/Login";

//Student imports
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentMessaging from "./pages/student/StudentMessaging";
import StudentTasks from "./pages/student/StudentTasks";
import StudentScheduling from "./pages/student/StudentScheduling";

//Lecturer imports
import LecturerDashboard from "./pages/lecturer/LecturerDashboard";
import LecturerMessaging from "./pages/lecturer/LecturerMessaging";
import LecturerSchedule from "./pages/lecturer/LecturerSchedule";
import LecturerSubmissions from "./pages/lecturer/LecturerSubmissions";

//Admin imports
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageRepository from "./pages/admin/ManageRepository";
import UserRequests from "./pages/admin/UserRequests";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";

//Repository
import Repository from "./pages/Repository"; 

//Components
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

        {/* Index Route */}
        <Route path="/" element={<Login />} />

        {/* Student Routes */}
        <Route path="/student/*" element={<LayoutWrapper />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="messaging" element={<StudentMessaging />} />
            <Route path="tasks" element={<StudentTasks />} />
            <Route path="schedule" element={<StudentScheduling />} />
        </Route>


        {/* Lecturer Routes */}
        <Route path="/lecturer/*" element={<LayoutWrapper />}>
            <Route path="dashboard" element={<LecturerDashboard />} />
            <Route path="messaging" element={<LecturerMessaging />} />
            <Route path="schedule" element={<LecturerSchedule />} />
            <Route path="submissions" element={<LecturerSubmissions />} />
        </Route>


        {/* Admin Routes */}
        <Route path="/admin/*" element={<LayoutWrapper />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="manage-users" element={<ManageUsers />} />
            <Route path="user-requests" element={<UserRequests />} />
            <Route path="manage-repository" element={<ManageRepository />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
        </Route>


        {/* Repository (Shared Page) */}
        <Route path="/repository" element={<Repository />} />


      </Routes>
    </Router>
  );
}

export default App;
