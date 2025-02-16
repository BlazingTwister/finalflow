import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import { useState } from "react";

function StudentDashboard() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar toggle state

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? "❌" : "☰"}
        </button>
        {isSidebarOpen && (
          <ul className="sidebar-links">
            <li onClick={() => navigate("/messaging")}>📩 Messages</li>
            <li onClick={() => navigate("/tasks")}>📌 Project Tasks</li>
            <li onClick={() => navigate("/schedule")}>📅 Meetings</li>
            <li onClick={() => navigate("/repository")}>📚 Capstone Repository</li>
          </ul>
        )}
      </aside>

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        <h2>Welcome, Student</h2>

        {/* Upcoming Tasks & Meetings Section */}
        <div className="dashboard-sections">
          <div className="dashboard-box">
            <h3>📌 Upcoming Tasks</h3>
            <ul>
              <li>Proposal Submission - <span>Due: Oct 20</span></li>
              <li>Presentation - <span>Due: Nov 5</span></li>
            </ul>
          </div>

          <div className="dashboard-box">
            <h3>📅 Upcoming Meetings</h3>
            <ul>
              <li>Meeting with Dr. Smith - <span>Oct 15, 10:00 AM</span></li>
              <li>Project Check-in - <span>Oct 22, 2:00 PM</span></li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default StudentDashboard;
