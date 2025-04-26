import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTasks } from "../../api/api"; 
import "../../styles/dashboard.css";

function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]); 
  const navigate = useNavigate();

    useEffect(() => {
      
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser)); // Parse the user info from localStorage
      }
  
      // Fetch tasks from the backend
      const loadTasks = async () => {
        try {
          const data = await fetchTasks(); 
          const incompleteTasks = data.filter(task => task.status !== "completed"); // Filter out completed tasks
          setTasks(incompleteTasks.slice(0, 3)); // Only show the first 3 tasks
        } catch (error) {
          console.error("Error fetching tasks:", error);
        }
      };
  
      loadTasks();
    }, []); 

  // Redirect to tasks page when a task is clicked
  const handleTaskClick = (taskId) => {
    navigate(`/student/tasks`, { state: { highlightTaskId: taskId } });
  };

  // Placeholder Data for the sections
  const upcomingMeetings = [
    { id: 1, title: "Meeting with Dr. Smith", date: "Oct 15, 10:00 AM" },
    { id: 2, title: "Project Check-in", date: "Oct 22, 2:00 PM" },
    { id: 3, title: "Review Presentation", date: "Nov 1, 11:00 AM" },
  ];


  // Handle redirection for meetings
  const handleMeetingClick = (meetingId) => {
    navigate(`/student/meetings`); 
  };

  return (
    <div className="dashboard-container">
      <h2>Welcome, {user ? `${user.fname} ${user.lname}` : "Student"}</h2>

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
          <h3>📌 Upcoming Tasks</h3>
          <ul>
            {tasks.map((task) => (
              <li
                key={task.id}
                onClick={() => handleTaskClick(task.id)} // Task click handler
                className="task-item" // Class for item styling
              >
                {task.title} {/* Display task title */}
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
