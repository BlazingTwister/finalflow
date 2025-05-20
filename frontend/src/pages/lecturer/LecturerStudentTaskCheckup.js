import React, { useState, useEffect, useCallback } from 'react';
import { fetchLecturerStudents, fetchTasksForSupervisedStudent } from '../../api/api'; 
import '../../styles/LecturerStudentTaskCheckup.css'; 

const LecturerStudentTaskCheckup = () => {
    const [supervisedStudents, setSupervisedStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null); // Stores the full student object
    const [studentTasks, setStudentTasks] = useState([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [isLoadingTasks, setIsLoadingTasks] = useState(false);
    const [error, setError] = useState(null);

    // Fetch supervised students on component mount
    const loadSupervisedStudents = useCallback(async () => {
        setIsLoadingStudents(true);
        setError(null);
        try {
            const students = await fetchLecturerStudents();
            setSupervisedStudents(students);
        } catch (err) {
            setError(err.message || err.error || 'Failed to fetch supervised students.');
            console.error("Error fetching supervised students:", err);
        } finally {
            setIsLoadingStudents(false);
        }
    }, []);

    useEffect(() => {
        loadSupervisedStudents();
    }, [loadSupervisedStudents]);

    // Handle selecting a student
    const handleSelectStudent = async (student) => {
        if (selectedStudent && selectedStudent.id === student.id) {
            // If clicking the same student again, deselect or simply do nothing/toggle
            setSelectedStudent(null);
            setStudentTasks([]);
            return;
        }
        setSelectedStudent(student);
        setIsLoadingTasks(true);
        setError(null); // Clear previous errors
        setStudentTasks([]); // Clear previous tasks
        try {
            const tasks = await fetchTasksForSupervisedStudent(student.id);
            setStudentTasks(tasks);
        } catch (err) {
            setError(err.message || err.error || `Failed to fetch tasks for ${student.fname}.`);
            console.error(`Error fetching tasks for student ${student.id}:`, err);
        } finally {
            setIsLoadingTasks(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        try {
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            return dateString;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'in_progress': return 'status-in-progress';
            case 'completed': return 'status-completed';
            default: return '';
        }
    };


    return (
        <div className="student-task-checkup-container">
            <h2>Student Task Check-up</h2>

            {error && <p className="error-message">{error}</p>}

            {selectedStudent ? (
                // View for Selected Student's Tasks 
                <div className="selected-student-tasks-view">
                    <button onClick={() => { setSelectedStudent(null); setStudentTasks([]); setError(null); }} className="back-button">
                        &larr; Back to Students List
                    </button>
                    <h3>Tasks for: {selectedStudent.fname} {selectedStudent.lname}</h3>
                    {isLoadingTasks && <p className="loading-message">Loading tasks...</p>}
                    {!isLoadingTasks && studentTasks.length === 0 && !error && (
                        <p>No tasks found for this student, or they haven't created any yet.</p>
                    )}
                    {!isLoadingTasks && studentTasks.length > 0 && (
                        <div className="tasks-list">
                            {studentTasks.map(task => (
                                <div key={task.id} className={`task-item-lecturer ${getStatusClass(task.status)}`}>
                                    <div className="task-header-lecturer">
                                        <h4>{task.title}</h4>
                                        <span className={`task-status-badge ${getStatusClass(task.status)}`}>
                                            {task.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    {task.description && <p className="task-description-lecturer"><strong>Description:</strong> {task.description}</p>}
                                    <p className="task-due-date-lecturer"><strong>Due Date:</strong> {formatDate(task.due_date)}</p>
                                    
                                    {task.sub_tasks && task.sub_tasks.length > 0 && (
                                        <div className="sub-tasks-section-lecturer">
                                            <h5>Sub-tasks:</h5>
                                            <ul className="sub-tasks-list-lecturer">
                                                {task.sub_tasks.map(subTask => (
                                                    <li key={subTask.id} className={subTask.status === 'completed' ? 'sub-task-completed' : ''}>
                                                        {subTask.title} 
                                                        <span className={`sub-task-status-badge ${subTask.status === 'completed' ? 'status-completed' : 'status-pending'}`}>
                                                            ({subTask.status})
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                // View for List of Supervised Students 
                <>
                    {isLoadingStudents && <p className="loading-message">Loading supervised students...</p>}
                    {!isLoadingStudents && supervisedStudents.length === 0 && !error && (
                        <p>You are not currently supervising any students, or no students were found.</p>
                    )}
                    {!isLoadingStudents && supervisedStudents.length > 0 && (
                        <div className="supervised-students-grid">
                            {supervisedStudents.map(student => (
                                <div key={student.id} className="student-card-lecturer" onClick={() => handleSelectStudent(student)}>
                                    <h4>{student.fname} {student.lname}</h4>
                                    <p>{student.email}</p>
                                    
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default LecturerStudentTaskCheckup;
