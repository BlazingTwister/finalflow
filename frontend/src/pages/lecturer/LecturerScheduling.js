import React, { useState, useEffect } from "react";
import Calendar from "../../components/Calendar";
import MeetingPopup from "../../components/MeetingPopup";
import "../../styles/scheduling.css";

const SchedulingPage = ({ userType }) => {
  // Sample data (Replace with API later)
  const meetingsData = {
    student: [
      { date: "2025-02-25", time: "10:00 AM", title: "Project Discussion", lecturer: "Dr. Smith" },
      { date: "2025-02-28", time: "3:00 PM", title: "Final Review", lecturer: "Dr. Smith" },
    ],
    lecturer: [
      { date: "2025-02-25", time: "10:00 AM", title: "Project Discussion", student: "John Doe" },
      { date: "2025-02-25", time: "11:30 AM", title: "Progress Review", student: "Jane Smith" },
      { date: "2025-02-28", time: "3:00 PM", title: "Final Review", student: "John Doe" },
    ],
  };

  const [selectedDate, setSelectedDate] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // Determine meetings based on user type
  const meetings = userType === "lecturer" ? meetingsData.lecturer : meetingsData.lecturer;

  return (
    <div className="scheduling-container">
      <h2>Schedule</h2>
      <div className="schedule-layout">
        <Calendar meetings={meetings} onDateSelect={setSelectedDate} onPopupToggle={setShowPopup} />
        
        <div className="upcoming-meetings">
          <h3>Upcoming Meetings</h3>
          <ul>
            {meetings.map((meeting, index) => (
              <li key={index}>
                <strong>{meeting.title}</strong> - {meeting.time} {userType === "lecturer" ? `with ${meeting.student}` : `with ${meeting.lecturer}`}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showPopup && <MeetingPopup date={selectedDate} meetings={meetings} onClose={() => setShowPopup(false)} />}
    </div>
  );
};

export default SchedulingPage;
