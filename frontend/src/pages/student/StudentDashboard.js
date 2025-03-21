import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import { useEffect, useState } from "react";

function StudentDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    // Retrieve user details from localStorage
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Parse JSON string to object
    }
  }, []);

  return (
    <div className="dashboard-main">
      
      {/* Display user's name dynamically */}
      <h2>Welcome, {user ? `${user.fname} ${user.lname}` : "Student"}</h2>

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
