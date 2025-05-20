import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { fetchTasks, fetchTaskProgress, fetchUser } from "../../api/api"; 
import "../../styles/studentdashboard.css";

function StudentDashboard() {
  const [user, setUser] = useState(null); // State for user details
  const [tasks, setTasks] = useState([]); // State for upcoming tasks list
  const [progress, setProgress] = useState(0); // State for progress percentage
  // Combined loading state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(''); // State for displaying errors
  const navigate = useNavigate();

  // useCallback to stabilize the function reference for useEffect dependency
  const loadDashboardData = useCallback(async () => {
    setIsLoading(true); // Start loading indicator
    setError(''); // Clear previous errors
    try {
        // Fetch user details, progress, and tasks concurrently
        const [userData, progressData, tasksData] = await Promise.all([
            fetchUser(), // Fetch user details from API
            fetchTaskProgress(), // Fetch progress percentage
            fetchTasks() // Fetch all tasks (will filter for display)
        ]);

        // --- Process User Data ---
        setUser(userData); // Store fetched user data in state
        
        // --- Process Progress Data ---
        setProgress(progressData.progress); // Store progress percentage

        // --- Process Tasks Data for Upcoming List ---
        const incompleteTasks = tasksData
             .filter(task => task.status !== "completed") // Filter out completed tasks
             .sort((a, b) => { // Sort by due date (ascending, nulls last)
                 if (!a.due_date) return 1;
                 if (!b.due_date) return -1;
                 return new Date(a.due_date) - new Date(b.due_date);
             });

        // Store top 3 upcoming tasks for display
        setTasks(incompleteTasks.slice(0, 3));

    } catch (err) {
        console.error("Error loading dashboard data:", err);
         setError(`Failed to load dashboard: ${err.message}. Please try refreshing.`);
         // Handle specific errors, e.g., 401 Unauthorized might mean redirecting to login
         if (err.response?.status === 401) {
            
             setError('Session expired. Please log in again.');
         }
         
          const storedUser = localStorage.getItem("user");
          if (storedUser && !user) { // Only if user state is still null
              try {
                  setUser(JSON.parse(storedUser));
                  console.warn("Displayed user data from localStorage as fallback.");
              } catch (parseError) {
                  console.error("Failed to parse user data from localStorage", parseError);
              }
          }

    } finally {
        setIsLoading(false); // Stop loading indicator regardless of success/failure
    }
  }, [navigate]); // Include navigate if used for redirection on error

  // useEffect to run the data loading function when the component mounts
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]); // Dependency array includes the stable loadDashboardData function

  // --- Event Handlers (Keep existing logic) ---
  // Redirects to the main tasks page, passing the clicked task ID for highlighting
  const handleTaskClick = (taskId) => {
    navigate(`/student/tasks`, { state: { highlightTaskId: taskId } });
  };

  // Placeholder data or fetch real data for meetings/milestones
  const upcomingMeetings = [
    { id: 1, title: "Meeting with Dr. Smith", date: "Oct 15, 10:00 AM" },
    { id: 2, title: "Project Check-in", date: "Oct 22, 2:00 PM" },
  ];
   const capstoneMilestones = [
       { id: 1, title: "Submit Proposal", date: "Oct 20" },
       { id: 2, title: "Final Report Due", date: "Nov 10" },
   ];

  // Placeholder navigation for meetings/milestones
  const handleMeetingClick = (meetingId) => { navigate(`/student/meetings`); };
  const handleMilestoneClick = (milestoneId) => { navigate(`/student/milestones`); };


  // --- Render Logic ---
   // Display a loading state while data is being fetched initially
   if (isLoading && !user) { // Show simplified loading before user data is available
       return <div className="dashboard-container loading-state"><p>Loading dashboard...</p></div>;
   }

   // Display error message if loading failed
   if (error && !user) { // Show error prominently if user data failed entirely
        return <div className="dashboard-container error-state"><p>{error}</p></div>;
   }

  return (
    <div className="dashboard-container">
      {/* Welcome message using fetched user data */}
      <h2>Welcome, {user ? `${user.fname} ${user.lname}` : "Student"}!</h2>

       {/* Display general errors that occurred after initial load */}
       {error && !isLoading && <p className="dashboard-error">{error}</p>}


      {/* Top Progress Section - Now dynamic */}
      <div className="top-progress">
        <h3>📈 Project Progress</h3>
         {/* Show loading indicator specifically for progress if needed, or rely on main isLoading */}
         {isLoading && progress === 0 ? <p>Calculating progress...</p> : (
            <>
                <div className="progress-bar">
                    {/* Style width based on the 'progress' state variable */}
                    <div className="progress" style={{ width: `${progress}%` }} title={`${progress}%`}></div>
                </div>
                {/* Display the progress percentage from state */}
                <p>{progress}% Completed</p>
            </>
         )}
      </div>

      {/* Bottom Sections */}
      <div className="bottom-sections">
        {/* Upcoming Meetings */}
        <div className="section meetings-section">
          <h3>📅 Upcoming Meetings</h3>
          {isLoading ? <p>Loading...</p> : upcomingMeetings.length > 0 ? (
              <ul> {upcomingMeetings.map((meeting) => ( <li key={meeting.id} onClick={() => handleMeetingClick(meeting.id)}>{meeting.title} - <span>{meeting.date}</span></li> ))} </ul>
          ) : <p>No upcoming meetings.</p>}
        </div>

        {/* Upcoming Tasks */}
        <div className="section tasks-section">
          <h3>📌 Upcoming Tasks</h3>
          {isLoading ? <p>Loading...</p> : tasks.length > 0 ? (
              <ul> {tasks.map((task) => ( <li key={task.id} onClick={() => handleTaskClick(task.id)} className="task-item-dashboard">{task.title} {task.due_date && <span className="task-due-date-dashboard"> (Due: {task.due_date})</span>}</li> ))} </ul>
          ) : <p>No upcoming tasks.</p>}
        </div>

        {/* Capstone Milestones */}
        <div className="section milestones-section">
          <h3>🚩 Capstone Milestones</h3>
           {isLoading ? <p>Loading...</p> : capstoneMilestones.length > 0 ? (
              <ul> {capstoneMilestones.map((milestone) => ( <li key={milestone.id} onClick={() => handleMilestoneClick(milestone.id)}>{milestone.title} - <span>{milestone.date}</span></li> ))} </ul>
            ) : <p>No milestones defined.</p>}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
