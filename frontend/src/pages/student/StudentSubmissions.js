import React, { useState, useEffect, useCallback } from 'react';
import { fetchStudentAssignedSlots, submitStudentWork } from '../../api/api'; 
import '../../styles/StudentSubmissions.css'; 

const StudentSubmissions = () => {
    const [assignedSlots, setAssignedSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedFiles, setSelectedFiles] = useState({}); // Store files per slot

    const clearMessages = () => {
        setError(null);
        setSuccessMessage('');
    };

    const loadAssignedSlots = useCallback(async () => {
        setIsLoading(true);
        clearMessages();
        try {
            const data = await fetchStudentAssignedSlots();
            setAssignedSlots(data);
        } catch (err) {
            setError(err.message || err.error || 'Failed to fetch assigned submission slots.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAssignedSlots();
    }, [loadAssignedSlots]);

    const handleFileChange = (event, slotId) => {
        setSelectedFiles(prev => ({
            ...prev,
            [slotId]: event.target.files
        }));
    };

    const handleSubmitWork = async (slotId) => {
        if (!selectedFiles[slotId] || selectedFiles[slotId].length === 0) {
            alert('Please select at least one file to submit.');
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < selectedFiles[slotId].length; i++) {
            formData.append('files[]', selectedFiles[slotId][i]);
        }

        setIsLoading(true);
        clearMessages();
        try {
            const result = await submitStudentWork(slotId, formData);
            setSuccessMessage(result.message || 'Work submitted successfully!');
            setSelectedFiles(prev => ({ ...prev, [slotId]: null })); // Clear selected files for this slot
            loadAssignedSlots(); // Refresh the list to show updated status
        } catch (err) {
            setError(err.message || err.error || JSON.stringify(err.errors) || 'Failed to submit work.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        try {
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            return dateString; // Fallback
        }
    };
    
    const isSlotPastDue = (slot) => {
        if (!slot || !slot.due_date) return false;
        return new Date(slot.due_date) < new Date();
    };

    if (isLoading && assignedSlots.length === 0) {
        return <p className="loading-message">Loading your submission slots...</p>;
    }

    return (
        <div className="student-submission-page-container">
            <h2>Your Submission Slots</h2>

            {isLoading && <p className="loading-inline">Processing...</p>}
            {error && <p className="error-inline">Error: {error}</p>}
            {successMessage && <p className="success-inline">{successMessage}</p>}

            {assignedSlots.length === 0 && !isLoading && !error && (
                <p>You have no submission slots assigned to you, or all assigned slots are past their due date.</p>
            )}

            <div className="slots-grid">
                {assignedSlots.map(slot => (
                    <div key={slot.id} className={`slot-card ${slot.has_submitted ? 'submitted' : 'not-submitted'} ${isSlotPastDue(slot) ? 'past-due' : ''} status-${slot.status}`}>
                        <div className="slot-card-header">
                            <h3>{slot.name}</h3>
                            <span className={`status-badge status-${slot.status}`}>{slot.status} {isSlotPastDue(slot) && slot.status === 'open' ? '(Past Due)' : ''}</span>
                        </div>
                        <p className="lecturer-name">Lecturer: {slot.lecturer_name}</p>
                        <p className="due-date">Due: {formatDate(slot.due_date)}</p>
                        {slot.description && <p className="description"><em>{slot.description}</em></p>}

                        <div className="submission-status-section">
                            <h4>Your Submission:</h4>
                            {slot.has_submitted && slot.my_submission_details ? (
                                <>
                                    <p>Status: <span className={`ack-status-${slot.my_submission_details.acknowledgement_status}`}>{slot.my_submission_details.acknowledgement_status}</span></p>
                                    <p>Submitted At: {formatDate(slot.my_submission_details.submitted_at)}</p>
                                    {slot.my_submission_details.files && slot.my_submission_details.files.length > 0 && (
                                        <div>
                                            <p>Files Submitted:</p>
                                            <ul>
                                                {slot.my_submission_details.files.map((file, index) => (
                                                    <li key={index}>{file.name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {slot.my_submission_details.lecturer_comment && (
                                        <div className="lecturer-comment">
                                            <strong>Lecturer's Comment:</strong>
                                            <p>{slot.my_submission_details.lecturer_comment}</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p>You have not submitted for this slot yet.</p>
                            )}
                        </div>
                        
                        {/* Allow submission if slot is open, not past due, AND student hasn't submitted OR re-submissions are allowed (current backend logic allows multiple) */}
                        {slot.status === 'open' && !isSlotPastDue(slot) && (
                             // Simple condition: allow new submission if not yet submitted.
                            
                            <div className="submission-form">
                                <h4>Submit Your Work:</h4>
                                <input 
                                    type="file" 
                                    multiple 
                                    onChange={(e) => handleFileChange(e, slot.id)}
                                    disabled={isLoading}
                                />
                                <button 
                                    onClick={() => handleSubmitWork(slot.id)} 
                                    disabled={isLoading || !selectedFiles[slot.id] || selectedFiles[slot.id].length === 0}
                                    className="submit-work-button"
                                >
                                    {isLoading ? 'Submitting...' : 'Submit Files'}
                                </button>
                            </div>
                            
                        )}
                         {(slot.status === 'closed' || isSlotPastDue(slot)) && (!slot.has_submitted && (
                            <p className="info-message"><em>This slot is closed or past due. Submissions are no longer accepted.</em></p>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentSubmissions;
