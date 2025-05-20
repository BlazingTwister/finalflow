import React, { useState, useEffect } from 'react';
// Import API functions needed within the modal
import { updateSubTaskStatus, deleteSubTask, addSubTask } from '../api/api.js'; 
import '../styles/SubTaskModal.css'; 

function SubTaskModal({ task, onClose, onSubTaskChange }) {
    // State for the list of sub-tasks displayed in the modal
    const [subTasks, setSubTasks] = useState([]);
    // State for the input field when adding a new sub-task
    const [newSubTaskTitle, setNewSubTaskTitle] = useState('');
    // State for displaying errors within the modal
    const [error, setError] = useState('');
    // State to indicate loading status (e.g., disable buttons during API calls)
    const [isLoading, setIsLoading] = useState(false);

    // Effect to initialize the modal's sub-task list when the 'task' prop changes
    useEffect(() => {
        // Ensure the passed task object exists and has a sub_tasks array
        if (task && Array.isArray(task.sub_tasks)) {
            setSubTasks(task.sub_tasks);
        } else {
            // If no task or sub_tasks array, reset to empty
            setSubTasks([]);
        }
        // Clear previous errors and input when modal opens for a new task
        setError('');
        setNewSubTaskTitle('');
    }, [task]); // Dependency: Re-run this effect if the parent task changes

    // If no task is provided (e.g., modal is closed), don't render anything
    if (!task) return null;

    // Event Handlers 

    // Handles toggling the status of a sub-task
    const handleStatusChange = async (subTaskId, currentStatus) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        setIsLoading(true);
        setError(''); // Clear previous errors
        try {
            // Call the API to update the status
            const result = await updateSubTaskStatus(subTaskId, newStatus); // API returns updated subtask and parent status

            // Optimistically update the local state for immediate UI feedback
            setSubTasks(currentSubTasks =>
                currentSubTasks.map(st =>
                    st.id === subTaskId ? { ...st, status: result.sub_task.status } : st // Use status from response
                )
            );

            
            onSubTaskChange(task.id, result.parent_task_status);

        } catch (err) {
            console.error("Error updating sub-task status:", err);
            setError(`Failed to update sub-task: ${err.response?.data?.message || err.message}`);
            
        } finally {
            setIsLoading(false); // Re-enable buttons
        }
    };

    // Handles deleting a sub-task
    const handleDelete = async (subTaskId) => {
        // Confirmation dialog
        if (!window.confirm("Are you sure you want to delete this sub-task?")) {
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            // Call the API to delete the sub-task
            const result = await deleteSubTask(subTaskId); // API returns parent status

            // Update local state by filtering out the deleted sub-task
            setSubTasks(currentSubTasks => currentSubTasks.filter(st => st.id !== subTaskId));

            // Notify the parent component about the change and the parent task's resulting status
            onSubTaskChange(task.id, result.parent_task_status);

        } catch (err) {
            console.error("Error deleting sub-task:", err);
             setError(`Failed to delete sub-task: ${err.response?.data?.message || err.message}`);
        } finally {
             setIsLoading(false);
        }
    };

    // Handles adding a new sub-task
    const handleAddSubTask = async (e) => {
        e.preventDefault(); // Prevent default form submission
        if (!newSubTaskTitle.trim()) {
            setError("Sub-task title cannot be empty.");
            return; // Don't add empty titles
        }

        // Prevent adding if the main task is already completed
         if (task.status === 'completed') {
             setError("Cannot add sub-tasks to a completed main task.");
             return;
         }


        setIsLoading(true);
        setError('');
        try {
            // Call the API to add the new sub-task
            const result = await addSubTask(task.id, { title: newSubTaskTitle.trim() }); // Send title

            // Add the newly created sub-task (from the API response) to the local state
            setSubTasks(currentSubTasks => [...currentSubTasks, result.sub_task]);

            setNewSubTaskTitle(''); // Clear the input field

            // Notify the parent (parent status won't change just by adding a sub-task)
            onSubTaskChange(task.id, task.status); // Pass current parent status

        } catch (err) {
            console.error("Error adding sub-task:", err);
             setError(`Failed to add sub-task: ${err.response?.data?.message || err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Render Logic 
    return (
        // Modal Overlay: Covers the screen, closes modal on click outside content
        <div className="modal-overlay" onClick={onClose}>
            {/* Modal Content: Stops propagation, so clicking inside doesn't close it */}
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">✖</button>

                {/* Modal Header */}
                <h3>Sub-Tasks for: "{task.title}"</h3>
                 <p className="modal-task-status">Main task status: <span className={`status-badge status-${task.status}`}>{task.status}</span></p>

                {/* Error Display Area */}
                {error && <p className="modal-error">{error}</p>}

                {/* List of Sub-tasks */}
                <ul className="subtask-list">
                    {subTasks.length > 0 ? (
                        subTasks.map(sub => (
                            <li key={sub.id} className={`subtask-item ${sub.status === 'completed' ? 'completed' : ''}`}>
                                {/* Clickable area to toggle status */}
                                <span
                                    className="subtask-title"
                                    onClick={() => !isLoading && task.status !== 'completed' && handleStatusChange(sub.id, sub.status)} // Only allow toggle if not loading and parent not completed
                                    style={{
                                        textDecoration: sub.status === 'completed' ? 'line-through' : 'none',
                                        cursor: isLoading || task.status === 'completed' ? 'not-allowed' : 'pointer', // Indicate clickability/disabled state
                                        color: sub.status === 'completed' ? '#6c757d' : 'inherit' // Grey out completed
                                    }}
                                    title={isLoading || task.status === 'completed' ? 'Cannot change status' : `Mark as ${sub.status === 'completed' ? 'Pending' : 'Completed'}`}
                                >
                                    {/* Simple indicator */}
                                    {sub.status === 'completed' ? '✔' : '◻'} {sub.title}
                                </span>
                                {/* Delete Button */}
                                <button
                                    onClick={() => !isLoading && handleDelete(sub.id)}
                                    className="delete-subtask-btn"
                                    disabled={isLoading} // Disable during loading
                                    title="Delete sub-task"
                                    aria-label={`Delete sub-task ${sub.title}`}
                                >
                                    🗑️
                                </button>
                            </li>
                        ))
                    ) : (
                        // Message shown when there are no sub-tasks
                        <p className="no-subtasks-modal">No sub-tasks added yet.</p>
                    )}
                </ul>

                 {/* Add Sub-task Form (Only show if main task is NOT completed) */}
                 {task.status !== 'completed' && (
                    <form onSubmit={handleAddSubTask} className="add-subtask-form">
                        <input
                            type="text"
                            placeholder="Add a new sub-task..."
                            value={newSubTaskTitle}
                            onChange={(e) => setNewSubTaskTitle(e.target.value)}
                            required
                            disabled={isLoading} // Disable input while loading
                            aria-label="New sub-task title"
                        />
                        <button type="submit" disabled={isLoading || !newSubTaskTitle.trim()}>
                            {isLoading ? 'Adding...' : 'Add'}
                        </button>
                    </form>
                 )}
                 {/* Inform user why add form might be hidden */}
                 {task.status === 'completed' && (
                     <p className="add-disabled-info">Cannot add sub-tasks because the main task is marked as completed.</p>
                 )}
            </div>
        </div>
    );
}

export default SubTaskModal;
