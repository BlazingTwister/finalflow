import React, { useState, useEffect, useCallback } from 'react';
import {
    fetchLecturerSubmissionSlots,
    createSubmissionSlot,
    fetchLecturerSubmissionSlotDetails,
    updateSubmissionSlot,
    deleteSubmissionSlot,
    postSlotToStudents,
    fetchLecturerStudents
} from '../../api/api.js'; // Adjust path as needed
import '../../styles/LecturerSubmissionSlots.css'; // We'll create this CSS file next

const LecturerSubmissionSlots = () => {
    const [slots, setSlots] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newSlotData, setNewSlotData] = useState({ name: '', description: '', due_date: '' });

    const [selectedSlotDetails, setSelectedSlotDetails] = useState(null);
    const [lecturerStudents, setLecturerStudents] = useState([]);
    const [studentsToPost, setStudentsToPost] = useState([]);
    const [postToAll, setPostToAll] = useState(false);

    const [editingSlot, setEditingSlot] = useState(null); // For editing existing slot

    const loadSlots = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchLecturerSubmissionSlots();
            setSlots(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch submission slots.');
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
            // Optionally set an error state for this
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
        try {
            await createSubmissionSlot(newSlotData);
            setNewSlotData({ name: '', description: '', due_date: '' });
            setShowCreateForm(false);
            loadSlots(); // Refresh list
        } catch (err) {
            setError(err.errors ? JSON.stringify(err.errors) : (err.message || 'Failed to create slot.'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditSlot = (slot) => {
        setEditingSlot({ ...slot, due_date: slot.due_date ? slot.due_date.substring(0, 16) : '' }); // Format for datetime-local
        setShowCreateForm(false); // Close create form if open
        setSelectedSlotDetails(null); // Close details view
    };
    
    const handleUpdateSlot = async (e) => {
        e.preventDefault();
        if (!editingSlot || !editingSlot.id) return;
        setIsLoading(true);
        try {
            // Ensure description is not undefined
            const payload = {
                ...editingSlot,
                description: editingSlot.description || '' 
            };
            await updateSubmissionSlot(editingSlot.id, payload);
            setEditingSlot(null);
            loadSlots(); // Refresh list
        } catch (err) {
            setError(err.errors ? JSON.stringify(err.errors) : (err.message || 'Failed to update slot.'));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };


    const handleDeleteSlot = async (slotId) => {
        if (window.confirm('Are you sure you want to delete this slot? This action cannot be undone.')) {
            setIsLoading(true);
            try {
                await deleteSubmissionSlot(slotId);
                loadSlots(); // Refresh list
                if (selectedSlotDetails && selectedSlotDetails.slot.id === slotId) {
                    setSelectedSlotDetails(null); // Clear details if deleted slot was selected
                }
            } catch (err) {
                setError(err.message || 'Failed to delete slot.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleViewDetails = async (slotId) => {
        setIsLoading(true);
        setError(null);
        setEditingSlot(null); // Close edit form
        try {
            const details = await fetchLecturerSubmissionSlotDetails(slotId);
            setSelectedSlotDetails(details);
            // Reset student selection for posting for the newly selected slot
            setStudentsToPost([]);
            setPostToAll(false);
        } catch (err) {
            setError(err.message || `Failed to fetch details for slot ${slotId}.`);
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
        try {
            const assignmentData = {
                student_ids: postToAll ? [] : studentsToPost, // Send empty array if postToAll is true, backend handles it
                post_to_all_students: postToAll,
            };
            await postSlotToStudents(slotId, assignmentData);
            alert('Slot posted successfully!');
            // Optionally refresh details to see updated 'is_assigned_to_slot' status,
            // or manage this state locally if the backend doesn't return updated assignment in this call.
            handleViewDetails(slotId); // Re-fetch details
        } catch (err) {
            setError(err.message || 'Failed to post slot to students.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };


    if (isLoading && !selectedSlotDetails && slots.length === 0) { // Show general loading only on initial load
        return <p className="loading-message">Loading submission slots...</p>;
    }

    if (error && slots.length === 0) { // Show general error only if nothing loaded
        return <p className="error-message">Error: {error}</p>;
    }

    return (
        <div className="lecturer-submission-slots-container">
            <h2>Manage Submission Slots</h2>

            {isLoading && <p className="loading-inline">Processing...</p>}
            {error && <p className="error-inline">Error: {error}</p>}


            {!editingSlot && <button onClick={() => { setShowCreateForm(!showCreateForm); setSelectedSlotDetails(null); setEditingSlot(null); }} className="action-button">
                {showCreateForm ? 'Cancel Creation' : 'Create New Slot'}
            </button>}

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
                    <button type="button" onClick={() => setEditingSlot(null)} className="cancel-button">Cancel Edit</button>
                </form>
            )}


            <h3>Existing Slots</h3>
            {slots.length === 0 && !isLoading && <p>No submission slots created yet.</p>}
            <ul className="slots-list">
                {slots.map(slot => (
                    <li key={slot.id} className={`slot-item ${selectedSlotDetails?.slot?.id === slot.id ? 'selected' : ''}`}>
                        <div className="slot-summary" onClick={() => selectedSlotDetails?.slot?.id === slot.id ? setSelectedSlotDetails(null) : handleViewDetails(slot.id)}>
                            <h4>{slot.name}</h4>
                            <p>Due: {formatDate(slot.due_date)}</p>
                            <p>Status: <span className={`status-${slot.status}`}>{slot.status}</span></p>
                        </div>
                         <div className="slot-actions">
                            <button onClick={(e) => { e.stopPropagation(); handleEditSlot(slot);}} className="edit-btn">Edit</button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteSlot(slot.id);}} disabled={isLoading} className="delete-btn">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>

            {selectedSlotDetails && (
                <div className="slot-details-view">
                    <h3>Details for: {selectedSlotDetails.slot.name}</h3>
                    <p><strong>Description:</strong> {selectedSlotDetails.slot.description || 'N/A'}</p>
                    <p><strong>Due Date:</strong> {formatDate(selectedSlotDetails.slot.due_date)}</p>
                    <p><strong>Status:</strong> <span className={`status-${selectedSlotDetails.slot.status}`}>{selectedSlotDetails.slot.status}</span></p>
                    <p><strong>Created:</strong> {formatDate(selectedSlotDetails.slot.created_at)}</p>

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
                                    <th>Status</th>
                                    {/*<th>Actions</th>*/}
                                </tr>
                            </thead>
                            <tbody>
                                {selectedSlotDetails.submission_statuses.map(subStatus => (
                                    <tr key={subStatus.student_id}>
                                        <td>{subStatus.fname} {subStatus.lname}</td>
                                        <td>{subStatus.email}</td>
                                        <td>{subStatus.is_assigned_to_slot ? 'Yes' : 'No'}</td>
                                        <td>{subStatus.has_submitted ? 'Yes' : 'No'}</td>
                                        <td>{subStatus.submission_details ? formatDate(subStatus.submission_details.submitted_at) : 'N/A'}</td>
                                        <td>{subStatus.submission_details ? subStatus.submission_details.acknowledgement_status : 'N/A'}</td>
                                        {/* <td>
                                            {subStatus.has_submitted && subStatus.submission_details.acknowledgement_status === 'pending' && (
                                                <button className="action-button-small">Acknowledge</button>
                                            )}
                                            {subStatus.has_submitted && (
                                                <button className="action-button-small">Download</button>
                                            )}
                                             <button className="action-button-small">Comment</button>
                                        </td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No students assigned to this lecturer or no submission data available.</p>
                    )}
                    <button onClick={() => setSelectedSlotDetails(null)} className="action-button">Close Details</button>
                </div>
            )}
        </div>
    );
};

export default LecturerSubmissionSlots;