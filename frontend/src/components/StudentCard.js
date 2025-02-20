import React from "react";

const StudentCard = ({ student, onView }) => {
  return (
    <div className="student-card">
      <h3>{student.project}</h3>
      <p><strong>Student:</strong> {student.name}</p>

      <div className="progress-bar">
        <div className="progress" style={{ width: `${student.progress}%` }}></div>
      </div>

      <p><strong>Last Submission:</strong> {student.lastSubmission}</p>

      <button className="view-btn" onClick={onView}>
        View Submissions
      </button>
    </div>
  );
};

export default StudentCard;
