import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../styles/dashboard.css";

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

  // Mock Data for the sections
  const upcomingMeetings = [
    { id: 1, title: "Meeting with Dr. Smith", date: "Oct 15, 10:00 AM" },
    { id: 2, title: "Project Check-in", date: "Oct 22, 2:00 PM" },
    { id: 3, title: "Review Presentation", date: "Nov 1, 11:00 AM" },
  ];

  const upcomingTasks = [
    { id: 1, title: "Finish Literature Review", due: "Oct 18" },
    { id: 2, title: "Email Supervisor", due: "Oct 20" },
    { id: 3, title: "Submit Proposal", due: "Oct 20" },
  ];

  // Handle redirection for meetings
  const handleMeetingClick = (meetingId) => {
    navigate(`/student/meetings`); // Assuming you have a calendar page with meeting details
  };

  // Handle redirection for tasks
  const handleTaskClick = (taskId) => {
    navigate(`/student/tasks`); // Assuming you have a tasks page for task details
  };

  return (
    <div className="dashboard-container">
      {/* Top Progress Section */}
      <div className="top-progress">
        <h3>📈 Project Progress</h3>
        <div className="progress-bar">
          <div className="progress" style={{ width: "70%" }}></div>
        </div>
        <p>70% Completed</p>
      </div>

      {/* Bottom Sections (Meetings, Milestones, Tasks) */}
      <div className="bottom-sections">
        {/* Upcoming Meetings Section */}
        <div className="section">
          <h3>📅 Upcoming Meetings</h3>
          <ul>
            {upcomingMeetings.slice(0, 3).map((meeting) => (
              <li key={meeting.id} onClick={() => handleMeetingClick(meeting.id)}>
                {meeting.title} - <span>{meeting.date}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Upcoming Tasks Section */}
        <div className="section">
          <h3>📝 Upcoming Tasks</h3>
          <ul>
            {upcomingTasks.slice(0, 3).map((task) => (
              <li key={task.id} onClick={() => handleTaskClick(task.id)}>
                {task.title} - <span>Due: {task.due}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Capstone Milestones Section */}
        <div className="section">
          <h3>🚩 Capstone Milestones</h3>
          <ul>
            <li>Submit Proposal - Oct 20</li>
            <li>Final Report Due - Nov 10</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default StudentDashboard;
