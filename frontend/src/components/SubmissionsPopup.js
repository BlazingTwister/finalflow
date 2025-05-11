import React from "react";

const SubmissionsPopup = ({ student, onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>{student.name}'s Submissions</h3>
        <ul>
          {student.submissions.map((sub, index) => (
            <li key={index}>
              {sub.file} - <span>{sub.date}</span>
            </li>
          ))}
        </ul>
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default SubmissionsPopup;
