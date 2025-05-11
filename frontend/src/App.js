import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Outlet } from "react-router-dom"; // Import Outlet
import Login from "./pages/Login";
import Logout from "./pages/Logout"; 
import Register from "./pages/Register"; 

//Student imports
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentMessaging from "./pages/student/StudentMessaging";
import StudentTasks from "./pages/student/StudentTasks";
import StudentScheduling from "./pages/student/StudentScheduling";

//Lecturer imports
import LecturerDashboard from "./pages/lecturer/LecturerDashboard";
import LecturerMessaging from "./pages/lecturer/LecturerMessaging";
import LecturerScheduling from "./pages/lecturer/LecturerScheduling";
import LecturerSubmissions from "./pages/lecturer/LecturerSubmissions";

//Admin imports
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageRepository from "./pages/admin/ManageRepository";
import UserRequests from "./pages/admin/UserRequests";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";

//Messaging
import Inbox from './components/Inbox';
import ComposeMessage from './components/ComposeMessage';

//Repository
import CapstoneRepository from "./pages/CapstoneRepository"; 

//Components
import Layout from "./components/Layout"; // Import Layout

//Testing
import Users from './components/Users'; //To test connection to laravel



const LayoutWrapper = () => (
  <Layout>
    <Outlet /> {/* This ensures child routes are rendered inside Layout */}
  </Layout>
);

function App() {
  return (
    <Router>
      <Routes>

        {/* Index (Shared Page) */}
        <Route path="/" element={<Register />} /> 

        {/* Login (Shared Page) */}
        <Route path="/login" element={<Login />} /> 

        {/* Register (Shared Page) */}
        <Route path="/registeration" element={<Register />} />

        {/* Logout (Shared Page) */}
        <Route path="/logout" element={<Logout />} /> 

        <Route path="/inbox" element={<Inbox />} />
        <Route path="/compose" element={<ComposeMessage />} />

        {/* Repository (Shared Page) */}
        <Route path="/repository" element={<LayoutWrapper />}>
            <Route index element={<CapstoneRepository />} />
        </Route>
        
        {/* Student Routes */}
        <Route path="/student/*" element={<LayoutWrapper />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="messaging" element={<StudentMessaging />} />
            <Route path="tasks" element={<StudentTasks />} />
            <Route path="meetings" element={<StudentScheduling />} />
        </Route>


        {/* Lecturer Routes */}
        <Route path="/lecturer/*" element={<LayoutWrapper />}>
            <Route path="dashboard" element={<LecturerDashboard />} />
            <Route path="messaging" element={<LecturerMessaging />} />
            <Route path="meetings" element={<LecturerScheduling />} />
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

      </Routes>
    </Router>
  );
}

export default App;
