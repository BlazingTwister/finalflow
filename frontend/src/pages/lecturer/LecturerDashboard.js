import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import { useState } from "react";

function LecturerDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar toggle state

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? "❌" : "☰"}
        </button>
        {isSidebarOpen && (
          <ul className="sidebar-links">
            <li onClick={() => navigate("/lecturer/messaging")}>📩 Messages</li>
            <li onClick={() => navigate("/lecturer/submissions")}>📂 Student Submissions</li>
            <li onClick={() => navigate("/lecturer/schedule")}>📅 Meetings</li>
            <li onClick={() => navigate("/lecturer/repository")}>📚 Capstone Repository</li>
          </ul>
        )}
      </aside>

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
