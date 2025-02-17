import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import { useEffect, useState } from "react";

function StudentDashboard() {
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  return (
    <div className="dashboard-main">
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
    </div>
  );
}

export default StudentDashboard;
