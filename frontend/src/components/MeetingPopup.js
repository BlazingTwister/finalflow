import React from "react";

const MeetingPopup = ({ date, meetings, onClose }) => {
  const filteredMeetings = meetings.filter((meeting) => meeting.date === date);

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>Meetings on {date}</h3>
        <ul>
          {filteredMeetings.map((meeting, index) => (
            <li key={index}>
              <strong>{meeting.title}</strong> - {meeting.time} {meeting.student ? `with ${meeting.student}` : `with ${meeting.lecturer}`}
            </li>
          ))}
        </ul>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default MeetingPopup;
