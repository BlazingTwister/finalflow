import React, { useState, useEffect, useCallback } from 'react';
import {
    fetchLecturerSubmissionSlots,
    createSubmissionSlot,
    fetchLecturerSubmissionSlotDetails,
    updateSubmissionSlot,
    deleteSubmissionSlot,
    postSlotToStudents,
    fetchLecturerStudents,
    acknowledgeStudentSubmission, 
    commentOnStudentSubmission,   
    downloadSubmissionFile        
} from '../../api/api.js';
import '../../styles/LecturerSubmissionSlots.css';

const LecturerSubmissionSlots = () => {
    const [slots, setSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newSlotData, setNewSlotData] = useState({ name: '', description: '', due_date: '' });

    const [selectedSlotDetails, setSelectedSlotDetails] = useState(null);
    const [lecturerStudents, setLecturerStudents] = useState([]);
    const [studentsToPost, setStudentsToPost] = useState([]);
    const [postToAll, setPostToAll] = useState(false);

    const [editingSlot, setEditingSlot] = useState(null);
    const [commentingSubmission, setCommentingSubmission] = useState(null); 
    const [commentText, setCommentText] = useState('');

    const clearMessages = () => {
        setError(null);
        setSuccessMessage('');
    };

    const loadSlots = useCallback(async () => {
        setIsLoading(true);
        clearMessages();
        try {
            const data = await fetchLecturerSubmissionSlots();
            setSlots(data);
        } catch (err) {
            setError(err.message || err.error || 'Failed to fetch submission slots.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadLecturerStudents = useCallback(async () => {
        
        try {
            const data = await fetchLecturerStudents();
            setLecturerStudents(data);
        } catch (err) {
            console.error('Failed to fetch lecturer students:', err);
            // setError('Failed to load students list for posting.'); // Optional: show error for this
        }
    }, []);

    useEffect(() => {
        loadSlots();
        loadLecturerStudents();
    }, [loadSlots, loadLecturerStudents]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (editingSlot) {
            setEditingSlot(prev => ({ ...prev, [name]: value }));
        } else {
            setNewSlotData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleCreateSlot = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        clearMessages();
        try {
            const result = await createSubmissionSlot(newSlotData);
            setNewSlotData({ name: '', description: '', due_date: '' });
            setShowCreateForm(false);
            setSuccessMessage(result.message || 'Slot created successfully!');
            loadSlots(); 
        } catch (err) {
            setError(err.message || err.error || JSON.stringify(err.errors) || 'Failed to create slot.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditSlot = (slot) => {
        setEditingSlot({ ...slot, due_date: slot.due_date ? slot.due_date.substring(0, 16) : '' });
        setShowCreateForm(false);
        setSelectedSlotDetails(null);
        clearMessages();
    };
    
    const handleUpdateSlot = async (e) => {
        e.preventDefault();
        if (!editingSlot || !editingSlot.id) return;
        setIsLoading(true);
        clearMessages();
        try {
            const payload = {
                ...editingSlot,
                description: editingSlot.description || '' 
            };
            const result = await updateSubmissionSlot(editingSlot.id, payload);
            setEditingSlot(null);
            setSuccessMessage(result.message || 'Slot updated successfully!');
            loadSlots(); 
        } catch (err) {
            setError(err.message || err.error || JSON.stringify(err.errors) || 'Failed to update slot.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (window.confirm('Are you sure you want to delete this slot? This action cannot be undone.')) {
            setIsLoading(true);
            clearMessages();
            try {
                const result = await deleteSubmissionSlot(slotId);
                setSuccessMessage(result.message || 'Slot deleted successfully!');
                loadSlots();
                if (selectedSlotDetails && selectedSlotDetails.slot.id === slotId) {
                    setSelectedSlotDetails(null);
                }
            } catch (err) {
                setError(err.message || err.error || 'Failed to delete slot.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleViewDetails = async (slotId) => {
        setIsLoading(true);
        clearMessages();
        setEditingSlot(null);
        try {
            const details = await fetchLecturerSubmissionSlotDetails(slotId);
            setSelectedSlotDetails(details);
            setStudentsToPost([]);
            setPostToAll(false);
        } catch (err) {
            setError(err.message || err.error || `Failed to fetch details for slot ${slotId}.`);
            console.error(err);
            setSelectedSlotDetails(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStudentSelectionChange = (studentId) => {
        setStudentsToPost(prev =>
            prev.includes(studentId) ? prev.filter(id => id !== studentId) : [...prev, studentId]
        );
    };

    const handlePostToStudents = async (slotId) => {
        if (!slotId) return;
        if (!postToAll && studentsToPost.length === 0) {
            alert("Please select students or choose 'Post to all my students'.");
            return;
        }
        setIsLoading(true);
        clearMessages();
        try {
            const assignmentData = {
                student_ids: postToAll ? [] : studentsToPost,
                post_to_all_students: postToAll,
            };
            const result = await postSlotToStudents(slotId, assignmentData);
            setSuccessMessage(result.message || 'Slot posted successfully!');
            handleViewDetails(slotId); // Re-fetch details to show updated assignment status
        } catch (err) {
            setError(err.message || err.error || 'Failed to post slot to students.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        try {
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            return dateString; // Fallback if date is invalid
        }
    };

    const handleAcknowledge = async (submissionId) => {
        if (!submissionId) return;
        setIsLoading(true);
        clearMessages();
        try {
            const result = await acknowledgeStudentSubmission(submissionId);
            setSuccessMessage(result.message || "Submission acknowledged.");
            // Refresh details to show updated status
            if (selectedSlotDetails) {
                handleViewDetails(selectedSlotDetails.slot.id);
            }
        } catch (err) {
            setError(err.message || err.error || "Failed to acknowledge submission.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const openCommentModal = (submission) => {
        if (!submission || !submission.id) return;
        setCommentingSubmission(submission);
        setCommentText(submission.lecturer_comment || ''); // Pre-fill with existing comment
        clearMessages();
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentingSubmission || !commentingSubmission.id) return;
        setIsLoading(true);
        clearMessages();
        try {
            const result = await commentOnStudentSubmission(commentingSubmission.id, { comment: commentText });
            setSuccessMessage(result.message || "Comment saved.");
            setCommentingSubmission(null);
            setCommentText('');
            // Refresh details
            if (selectedSlotDetails) {
                handleViewDetails(selectedSlotDetails.slot.id);
            }
        } catch (err) {
            setError(err.message || err.error || JSON.stringify(err.errors) || "Failed to save comment.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadFile = async (fileId, fileName) => {
        if (!fileId) return;
        // setIsLoading(true); // Optional: set loading for download button
        clearMessages();
        try {
            const result = await downloadSubmissionFile(fileId); // API function handles actual download
            setSuccessMessage(result.message || `Download for ${fileName} initiated.`);
        } catch (err) {
            setError(err.message || err.error || `Failed to download file ${fileName}. Ensure it's acknowledged.`);
            console.error(err);
        } finally {
            // setIsLoading(false);
        }
    };
    
    const isSlotPastDue = (slot) => {
        if (!slot || !slot.due_date) return false;
        return new Date(slot.due_date) < new Date();
    };


    return (
        <div className="lecturer-submission-slots-container">
            <h2>Manage Submission Slots</h2>

            {isLoading && <p className="loading-inline">Processing...</p>}
            {error && <p className="error-inline">Error: {error}</p>}
            {successMessage && <p className="success-inline">{successMessage}</p>}


            {!editingSlot && (
                <button 
                    onClick={() => { setShowCreateForm(!showCreateForm); setSelectedSlotDetails(null); setEditingSlot(null); clearMessages(); }} 
                    className="action-button"
                >
                    {showCreateForm ? 'Cancel Creation' : '+ Create New Slot'}
                </button>
            )}

            {showCreateForm && !editingSlot && (
                <form onSubmit={handleCreateSlot} className="slot-form">
                    <h3>Create New Submission Slot</h3>
                    <div>
                        <label htmlFor="name">Slot Name:</label>
                        <input type="text" id="name" name="name" value={newSlotData.name} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <label htmlFor="description">Description (Optional):</label>
                        <textarea id="description" name="description" value={newSlotData.description} onChange={handleInputChange}></textarea>
                    </div>
                    <div>
                        <label htmlFor="due_date">Due Date:</label>
                        <input type="datetime-local" id="due_date" name="due_date" value={newSlotData.due_date} onChange={handleInputChange} required />
                    </div>
                    <button type="submit" disabled={isLoading} className="submit-button">Create Slot</button>
                </form>
            )}

            {editingSlot && (
                 <form onSubmit={handleUpdateSlot} className="slot-form editing-form">
                    <h3>Edit Submission Slot: {editingSlot.name}</h3>
                    <div>
                        <label htmlFor="edit_name">Slot Name:</label>
                        <input type="text" id="edit_name" name="name" value={editingSlot.name} onChange={handleInputChange} required />
                    </div>
                    <div>
                        <label htmlFor="edit_description">Description (Optional):</label>
                        <textarea id="edit_description" name="description" value={editingSlot.description || ''} onChange={handleInputChange}></textarea>
                    </div>
                    <div>
                        <label htmlFor="edit_due_date">Due Date:</label>
                        <input type="datetime-local" id="edit_due_date" name="due_date" value={editingSlot.due_date} onChange={handleInputChange} required />
                    </div>
                     <div>
                        <label htmlFor="edit_status">Status:</label>
                        <select id="edit_status" name="status" value={editingSlot.status} onChange={handleInputChange}>
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    <button type="submit" disabled={isLoading} className="submit-button">Update Slot</button>
                    <button type="button" onClick={() => { setEditingSlot(null); clearMessages();}} className="cancel-button">Cancel Edit</button>
                </form>
            )}


            <h3>Existing Slots</h3>
            {slots.length === 0 && !isLoading && !error && <p>No submission slots created yet.</p>}
            <ul className="slots-list">
                {slots.map(slot => (
                    <li key={slot.id} className={`slot-item ${selectedSlotDetails?.slot?.id === slot.id ? 'selected' : ''} ${isSlotPastDue(slot) && slot.status === 'open' ? 'past-due' : ''} status-${slot.status}`}>
                        <div className="slot-summary" onClick={() => selectedSlotDetails?.slot?.id === slot.id ? setSelectedSlotDetails(null) : handleViewDetails(slot.id)}>
                            <h4>{slot.name}</h4>
                            <p>Due: {formatDate(slot.due_date)}</p>
                            <p>Status: <span className={`status-text status-${slot.status}`}>{slot.status} {isSlotPastDue(slot) && slot.status === 'open' ? '(Past Due)' : ''}</span></p>
                        </div>
                         <div className="slot-actions">
                            <button onClick={(e) => { e.stopPropagation(); handleEditSlot(slot);}} className="edit-btn" title="Edit Slot">✏️</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteSlot(slot.id);}} disabled={isLoading} className="delete-btn" title="Delete Slot">🗑️</button>
                        </div>
                    </li>
                ))}
            </ul>

            {selectedSlotDetails && (
                <div className="slot-details-view">
                    <h3>Details for: {selectedSlotDetails.slot.name}</h3>
                    <p><strong>Description:</strong> {selectedSlotDetails.slot.description || 'N/A'}</p>
                    <p><strong>Due Date:</strong> {formatDate(selectedSlotDetails.slot.due_date)}</p>
                    <p><strong>Status:</strong> <span className={`status-text status-${selectedSlotDetails.slot.status}`}>{selectedSlotDetails.slot.status} {isSlotPastDue(selectedSlotDetails.slot) && selectedSlotDetails.slot.status === 'open' ? '(Past Due)' : ''}</span></p>
                    <p><strong>Created:</strong> {formatDate(selectedSlotDetails.slot.created_at)}</p>

                    {selectedSlotDetails.slot.status === 'open' && !isSlotPastDue(selectedSlotDetails.slot) && (
                        <div className="post-to-students-section">
                            <h4>Post to Students</h4>
                            <div>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={postToAll}
                                        onChange={(e) => setPostToAll(e.target.checked)}
                                    />
                                    Post to all my students
                                </label>
                            </div>
                            {!postToAll && lecturerStudents.length > 0 && (
                                <div className="student-selection-list">
                                    <p>Or select specific students:</p>
                                    {lecturerStudents.map(student => (
                                        <label key={student.id}>
                                            <input
                                                type="checkbox"
                                                value={student.id}
                                                checked={studentsToPost.includes(student.id)}
                                                onChange={() => handleStudentSelectionChange(student.id)}
                                            />
                                            {student.fname} {student.lname} ({student.email})
                                        </label>
                                    ))}
                                </div>
                            )}
                            {!postToAll && lecturerStudents.length === 0 && <p>No students available to select.</p>}
                            <button onClick={() => handlePostToStudents(selectedSlotDetails.slot.id)} disabled={isLoading} className="action-button">
                                Post Selected
                            </button>
                        </div>
                    )}
                     { (selectedSlotDetails.slot.status === 'closed' || isSlotPastDue(selectedSlotDetails.slot)) && (
                        <p className="info-message"><em>This slot is closed or past its due date. Posting to new students is disabled.</em></p>
                    )}


                    <h4>Student Submissions & Status</h4>
                    {selectedSlotDetails.submission_statuses && selectedSlotDetails.submission_statuses.length > 0 ? (
                        <table className="student-submissions-table">
                            <thead>
                                <tr>
                                    <th>Student Name</th>
                                    <th>Email</th>
                                    <th>Assigned?</th>
                                    <th>Submitted?</th>
                                    <th>Submitted At</th>
                                    <th>Ack. Status</th>
                                    <th>Files</th>
                                    <th>Comment</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedSlotDetails.submission_statuses.map(subStatus => (
                                    <tr key={subStatus.student_id}>
                                        <td>{subStatus.fname} {subStatus.lname}</td>
                                        <td>{subStatus.email}</td>
                                        <td>{subStatus.is_assigned_to_slot ? 'Yes' : <span className="text-muted">No</span>}</td>
                                        <td>{subStatus.has_submitted ? 'Yes' : <span className="text-muted">No</span>}</td>
                                        <td>{subStatus.submission_details ? formatDate(subStatus.submission_details.submitted_at) : 'N/A'}</td>
                                        <td>
                                            {subStatus.submission_details ? 
                                                <span className={`ack-status-${subStatus.submission_details.acknowledgement_status}`}>
                                                    {subStatus.submission_details.acknowledgement_status}
                                                    {subStatus.submission_details.acknowledged_at ? ` (${formatDate(subStatus.submission_details.acknowledged_at)})` : ''}
                                                </span> 
                                                : 'N/A'}
                                        </td>
                                        <td>
                                            {subStatus.submission_details && subStatus.submission_details.files.length > 0 ? (
                                                <ul>
                                                    {subStatus.submission_details.files.map(file => (
                                                        <li key={file.id}>
                                                            {file.name}
                                                            {subStatus.submission_details.acknowledgement_status === 'acknowledged' && (
                                                                <button 
                                                                    onClick={() => handleDownloadFile(file.id, file.name)} 
                                                                    className="action-button-small download-btn"
                                                                    disabled={isLoading}
                                                                    title="Download File"
                                                                > 💾
                                                                </button>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (subStatus.has_submitted ? <span className="text-muted">No files</span> : 'N/A')}
                                        </td>
                                        <td className="comment-cell">
                                            {subStatus.submission_details?.lecturer_comment || <span className="text-muted">N/A</span>}
                                        </td>
                                        <td className="actions-cell">
                                            {subStatus.has_submitted && (
                                                <>
                                                    {subStatus.submission_details.acknowledgement_status === 'pending' && (
                                                        <button 
                                                            onClick={() => handleAcknowledge(subStatus.submission_details.id)} 
                                                            className="action-button-small acknowledge-btn"
                                                            disabled={isLoading}
                                                            title="Acknowledge Submission"
                                                        >✔️ Ack</button>
                                                    )}
                                                    <button 
                                                        onClick={() => openCommentModal(subStatus.submission_details)} 
                                                        className="action-button-small comment-btn"
                                                        disabled={isLoading}
                                                        title="Add/Edit Comment"
                                                    >💬 Comment</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No students supervised by you, or no submission data available for this slot's assigned students.</p>
                    )}
                    <button onClick={() => {setSelectedSlotDetails(null); clearMessages();}} className="action-button">Close Details</button>
                </div>
            )}

            {/* Comment Modal */}
            {commentingSubmission && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h3>Comment on Submission</h3>
                        <p>Student: {selectedSlotDetails?.submission_statuses.find(s => s.submission_details?.id === commentingSubmission.id)?.fname} {selectedSlotDetails?.submission_statuses.find(s => s.submission_details?.id === commentingSubmission.id)?.lname}</p>
                        <form onSubmit={handleCommentSubmit}>
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Enter your comment..."
                                rows="4"
                                required
                                disabled={isLoading}
                            />
                            <div className="modal-actions">
                                <button type="submit" className="submit-button" disabled={isLoading}>Save Comment</button>
                                <button type="button" className="cancel-button" onClick={() => {setCommentingSubmission(null); setCommentText('');}} disabled={isLoading}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LecturerSubmissionSlots;
