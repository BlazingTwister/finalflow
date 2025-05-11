import React, { useState } from "react";
import StudentCard from "../../components/StudentCard";
import SubmissionsPopup from "../../components/SubmissionsPopup";
import "../../styles/lecturersubmissions.css";

const LecturerSubmissions = () => {
  // Sample data (Replace this with API data later)
  const students = [
    {
      id: 1,
      name: "John Doe",
      project: "AI Research",
      progress: 75,
      lastSubmission: "Report.pdf (Feb 15, 2025, 10:30 AM)",
      submissions: [
        { file: "Proposal.pdf", date: "Jan 10, 2025, 2:00 PM" },
        { file: "Draft.docx", date: "Jan 25, 2025, 5:15 PM" },
        { file: "Report.pdf", date: "Feb 15, 2025, 10:30 AM" },
      ],
    },
    {
      id: 2,
      name: "Jane Smith",
      project: "Blockchain Security",
      progress: 50,
      lastSubmission: "Analysis.xlsx (Feb 12, 2025, 9:15 AM)",
      submissions: [
        { file: "Outline.docx", date: "Jan 5, 2025, 11:00 AM" },
        { file: "Analysis.xlsx", date: "Feb 12, 2025, 9:15 AM" },
      ],
    },
    {
      id: 1,
      name: "John Doe",
      project: "AI Research",
      progress: 75,
      lastSubmission: "Report.pdf (Feb 15, 2025, 10:30 AM)",
      submissions: [
        { file: "Proposal.pdf", date: "Jan 10, 2025, 2:00 PM" },
        { file: "Draft.docx", date: "Jan 25, 2025, 5:15 PM" },
        { file: "Report.pdf", date: "Feb 15, 2025, 10:30 AM" },
      ],
    },
    {
      id: 1,
      name: "John Doe",
      project: "AI Research",
      progress: 75,
      lastSubmission: "Report.pdf (Feb 15, 2025, 10:30 AM)",
      submissions: [
        { file: "Proposal.pdf", date: "Jan 10, 2025, 2:00 PM" },
        { file: "Draft.docx", date: "Jan 25, 2025, 5:15 PM" },
        { file: "Report.pdf", date: "Feb 15, 2025, 10:30 AM" },
      ],
    },
    {
      id: 1,
      name: "John Doe",
      project: "AI Research",
      progress: 75,
      lastSubmission: "Report.pdf (Feb 15, 2025, 10:30 AM)",
      submissions: [
        { file: "Proposal.pdf", date: "Jan 10, 2025, 2:00 PM" },
        { file: "Draft.docx", date: "Jan 25, 2025, 5:15 PM" },
        { file: "Report.pdf", date: "Feb 15, 2025, 10:30 AM" },
      ],
    },
  ];

  const [selectedStudent, setSelectedStudent] = useState(null);

  return (
    <div className="lecturer-submissions">
      <h2>Student Submissions</h2>
      <div className="students-list">
        {students.map((student) => (
          <StudentCard
            key={student.id}
            student={student}
            onView={() => setSelectedStudent(student)}
          />
        ))}
      </div>

      {selectedStudent && (
        <SubmissionsPopup
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

export default LecturerSubmissions;