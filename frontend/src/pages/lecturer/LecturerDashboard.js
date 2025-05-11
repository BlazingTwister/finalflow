import { useNavigate } from "react-router-dom";
import "../../styles/studentdashboard.css"; //Change to Lecturer
import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar"; // Import Sidebar component

function LecturerDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar toggle state
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? "" : "sidebar-closed"}`}>

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        <h2>Welcome, Lecturer</h2>

        {/* Upcoming Meetings & Notifications Section */}
        <div className="dashboard-sections">
          <div className="dashboard-box">
            <h3>📌 Student Submissions</h3>
            <ul>
              <li>Proposal - John Doe <span>Submitted: Oct 10</span></li>
              <li>Report - Jane Smith <span>Submitted: Oct 12</span></li>
            </ul>
          </div>

          <div className="dashboard-box">
            <h3>📅 Upcoming Meetings</h3>
            <ul>
              <li>Meeting with John Doe - <span>Oct 15, 2:00 PM</span></li>
              <li>Project Review - <span>Oct 22, 11:00 AM</span></li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LecturerDashboard;
