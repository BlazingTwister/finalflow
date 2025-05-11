// src/pages/student/StudentTasks.js (Assuming path)

import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
// Updated API imports including sub-task and user functions
import { fetchTasks, addTask, updateTaskStatus, deleteTask, fetchUser } from "../../api/api"; // Ensure fetchUser is imported if needed here, though likely dashboard uses it primarily
import SubTaskModal from '../../components/SubTaskModal.js'; // Import the modal component (adjust path)
import "../../styles/tasks.css"; // Your existing styles, will be updated in next step

const StudentTasks = () => {
    const [tasks, setTasks] = useState([]);
    // State for the main task form
    const [newTask, setNewTask] = useState({ title: "", description: "", due_date: "" });
    // State for the list of sub-task input values in the form
    const [newSubTasks, setNewSubTasks] = useState(['']); // Start with one empty sub-task input
    const [showForm, setShowForm] = useState(false); // Toggle add task form visibility
    const location = useLocation();
    const highlightTaskId = location.state?.highlightTaskId; // Task ID passed from dashboard
    const [highlightedTaskId, setHighlightedTaskId] = useState(null); // State for highlighting animation
    // State to hold the task object whose sub-tasks are being viewed/edited in the modal
    const [selectedTaskForModal, setSelectedTaskForModal] = useState(null);
    // General loading state for API calls affecting the table
    const [isLoading, setIsLoading] = useState(false);
    // State to display general errors (e.g., loading tasks failed)
     const [error, setError] = useState('');

    // --- Highlighting Effect (Keep as is from your file) ---
    useEffect(() => {
         if (highlightTaskId) {
            setHighlightedTaskId(null); // Clear previous immediately
            const delayTimer = setTimeout(() => {
                setHighlightedTaskId(highlightTaskId); // Apply highlight class
                const breathingDuration = 2000; // Match CSS animation
                const clearTimer = setTimeout(() => setHighlightedTaskId(null), breathingDuration); // Remove after animation
                return () => clearTimeout(clearTimer); // Cleanup clear timer
            }, 300); // Small delay before starting
            return () => clearTimeout(delayTimer); // Cleanup delay timer
        }
    }, [highlightTaskId]); // Re-run if highlighted task ID changes

    // --- Load Tasks Function (using useCallback for stability) ---
    const loadTasks = useCallback(async () => {
        setIsLoading(true);
        setError(''); // Clear previous errors
        try {
            const data = await fetchTasks(); // fetchTasks now ensures sub_tasks is an array
            setTasks(data);
        } catch (err) {
            console.error("Error fetching tasks:", err);
             setError(`Failed to load tasks: ${err.message}`); // Set error message
        } finally {
            setIsLoading(false);
        }
    }, []); // No dependencies, called once on mount

    // Load tasks when component mounts
    useEffect(() => {
        loadTasks();
    }, [loadTasks]); // Include loadTasks (stable due to useCallback)

    // --- Sub-task Input Field Handlers (for the Add Task form) ---
    const handleSubTaskChange = (index, value) => {
        const updatedSubTasks = [...newSubTasks];
        updatedSubTasks[index] = value;
        setNewSubTasks(updatedSubTasks);
    };

    const addSubTaskInput = () => {
        // Add a new empty string to the array, triggering a new input field render
        setNewSubTasks([...newSubTasks, '']);
    };

    const removeSubTaskInput = (indexToRemove) => {
         // Keep at least one input field, just clear it if it's the last one
         if (newSubTasks.length <= 1) {
             setNewSubTasks(['']); // Reset the only input field
             return;
         }
        // Filter out the sub-task input at the specified index
        const updatedSubTasks = newSubTasks.filter((_, index) => index !== indexToRemove);
        setNewSubTasks(updatedSubTasks);
    };

    // --- Add Task Handler (includes sub-tasks) ---
    const handleAddTask = async () => {
        // Basic validation for required fields
        if (!newTask.title.trim() || !newTask.due_date) {
             setError('Task Title and Due Date are required.');
            return;
        }

        // Prepare sub-tasks: trim whitespace and filter out empty strings
        const subTasksToAdd = newSubTasks
            .map(st => st.trim())
            .filter(st => st !== '');

        setIsLoading(true); // Indicate loading state
        setError(''); // Clear previous errors

        try {
            // Call API to add the task and its sub-tasks
            await addTask({
                ...newTask,
                title: newTask.title.trim(), // Send trimmed title
                sub_tasks: subTasksToAdd // Send the cleaned array of sub-task titles
            });

            // Reset form states on success
            setNewTask({ title: "", description: "", due_date: "" });
            setNewSubTasks(['']); // Reset sub-task inputs to one empty field
            setShowForm(false); // Hide the form
            loadTasks(); // Reload the task list to show the new task
        } catch (err) {
            console.error("Error adding task:", err);
             setError(`Failed to add task: ${err.response?.data?.message || err.message}`);
        } finally {
             setIsLoading(false);
        }
    };

    // --- Update MAIN Task Status Handler ---
    const handleUpdateStatus = async (taskId, currentStatus) => {
         // Simple toggle: if completed -> pending, otherwise -> completed
         // Adjust if you need 'in_progress' state toggle logic
         const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';

        // Find the task locally first for immediate UI update (optional but good UX)
        const taskIndex = tasks.findIndex(t => t.id === taskId);
         if (taskIndex === -1) return; // Should not happen

         // Create a temporary updated tasks list for optimistic update
         const originalTasks = [...tasks]; // Keep a copy to revert on error
        const updatedTasks = [...tasks];
        updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], status: newStatus };
        setTasks(updatedTasks); // Optimistically update UI

        setError(''); // Clear errors before trying

        try {
            // Call the API to update the status
            await updateTaskStatus(taskId, newStatus);
            // If API succeeds, the optimistic update is correct. Optionally reload for consistency:
            // loadTasks(); // Or just trust the optimistic update if API returns the updated task
        } catch (err) {
            console.error("Error updating task status:", err);
            setError(`Failed to update status: ${err.response?.data?.message || err.message}`);
            setTasks(originalTasks); // Revert UI on error
        }
         // Note: No setIsLoading here as it's a quick toggle, adjust if needed
    };

    // --- Delete MAIN Task Handler ---
    const handleDelete = async (taskId) => {
        // Confirmation dialog
        if (!window.confirm("Are you sure you want to delete this task and ALL its sub-tasks? This cannot be undone.")) {
            return;
        }
        setIsLoading(true); // Indicate loading as this might take a moment
        setError('');
        try {
            await deleteTask(taskId); // Call API to delete
            loadTasks(); // Reload tasks list on success
        } catch (err) {
            console.error("Error deleting task:", err);
             setError(`Failed to delete task: ${err.response?.data?.message || err.message}`);
             setIsLoading(false); // Ensure loading is turned off on error too
        }
        // setIsLoading(false); // Already handled in finally block if loadTasks has one
    };

    // --- Modal Handling ---
    const openModal = (task) => {
        // Only open modal if the task actually has sub-tasks (based on backend data)
         if (task && Array.isArray(task.sub_tasks)) { // Check if sub_tasks is an array
             setSelectedTaskForModal(task);
         } else {
             console.warn("Attempted to open modal for task with no sub-tasks array:", task);
         }
    };

    const closeModal = () => {
        setSelectedTaskForModal(null); // Clear the selected task to close the modal
    };

    // --- Callback for Sub-Task Changes from Modal ---
    // This function is passed to SubTaskModal and called when a sub-task is added, updated, or deleted.
    const handleSubTaskChangeCallback = (updatedParentTaskId, parentTaskNewStatus) => {
        // Find the parent task in the current state
        const taskToUpdate = tasks.find(t => t.id === updatedParentTaskId);

        if (taskToUpdate) {
             // Reload all tasks to get the most up-to-date sub-task list and parent status
             // This is simpler than trying to merge partial updates locally.
             loadTasks();

            // If the modal is still open for this task, update its data
            // so the modal reflects the latest changes immediately after reload finishes.
             if (selectedTaskForModal && selectedTaskForModal.id === updatedParentTaskId) {
                // We need the *reloaded* task data here.
                // This is tricky. Option 1: Reload *then* update modal state.
                // Option 2: Update modal state optimistically (complex).
                // Let's stick to reloading tasks, the modal will close/reopen if needed.
                // Or better: Refetch just the single task data after modal action if performance is key.
                // For now, loadTasks() handles consistency.
             }
        }
    };

    // --- Helper Function to Calculate Sub-Task Progress (for display) ---
    const calculateLocalProgress = (task) => {
         // If the main task is marked complete, progress is 100%
         if (task.status === 'completed') return 100;
         // If no sub-tasks or sub_tasks is not an array, progress is 0% (unless main task is complete)
        if (!Array.isArray(task.sub_tasks) || task.sub_tasks.length === 0) return 0;

        const completedSubTasks = task.sub_tasks.filter(st => st.status === 'completed').length;
        const totalSubTasks = task.sub_tasks.length;

        // Calculate percentage, avoid division by zero
        return totalSubTasks > 0 ? Math.round((completedSubTasks / totalSubTasks) * 100) : 0;
    };

    // --- Render Logic ---
    return (
        <div className="tasks-container"> {/* Main container */}
            <h2>📌 Your Tasks</h2> {/* Page Title */}

            {/* Toggle button for the Add Task form */}
            <button className="toggle-form-btn" onClick={() => setShowForm(!showForm)}>
                {showForm ? "✖ Hide Form" : "➕ Add New Task"}
            </button>

            {/* Add Task Form */}
            {showForm && (
                <div className="add-task-form"> {/* Form container */}
                    <h3>Add New Task</h3>
                    {/* Input for Task Title */}
                    <input
                        type="text"
                        placeholder="* Task Title (Required)"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        aria-required="true"
                    />
                    {/* Textarea for Task Description */}
                    <textarea
                        placeholder="Description (Optional)"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        rows="3"
                    />
                    {/* Input for Due Date */}
                     <label htmlFor="due_date" className="form-label">Due Date (* Required)</label>
                    <input
                        id="due_date"
                        type="date"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                        aria-required="true"
                        className="due-date-input"
                    />

                     {/* Sub-task Input Section */}
                    <h4 className="subtask-header">Sub-Tasks (Optional - Add steps for this task)</h4>
                    <div className="subtask-inputs">
                        {newSubTasks.map((subTaskTitle, index) => (
                            <div key={index} className="subtask-input-row">
                                {/* Input field for each sub-task */}
                                <input
                                    type="text"
                                    placeholder={`Sub-task ${index + 1}`}
                                    value={subTaskTitle}
                                    onChange={(e) => handleSubTaskChange(index, e.target.value)}
                                    aria-label={`Sub-task ${index + 1} title`}
                                />
                                 {/* Button to remove this sub-task input field */}
                                 <button
                                    type="button" // Prevent form submission
                                    onClick={() => removeSubTaskInput(index)}
                                    className="remove-subtask-btn"
                                    title="Remove this sub-task field"
                                    aria-label={`Remove sub-task field ${index + 1}`}
                                >
                                    &times; {/* Multiplication sign for 'x' */}
                                 </button>
                            </div>
                        ))}
                         {/* Button to add another sub-task input field */}
                        <button type="button" onClick={addSubTaskInput} className="add-subtask-btn">
                            + Add Another Sub-task Field
                        </button>
                    </div>

                    {/* Button to save the new task */}
                    <button onClick={handleAddTask} disabled={isLoading} className="save-task-btn">
                        {isLoading ? 'Saving...' : '✅ Save Task'}
                    </button>
                </div>
            )}

            {/* Display general errors here */}
            {error && <p className="error-message">{error}</p>}

            {/* Task Table Container */}
            <div className="task-table-container">
                {/* Loading indicator shown only when fetching and no tasks are yet displayed */}
                {isLoading && tasks.length === 0 && <p className="loading-message">Loading tasks...</p>}
                {/* Message shown when not loading, no tasks exist, and there's no error */}
                {!isLoading && tasks.length === 0 && !error && (
                    <p className="no-tasks">No tasks available. Add one using the form above!</p>
                )}

                {/* Render the table only if there are tasks */}
                {tasks.length > 0 && (
                    <table className="task-table">
                        {/* Table Header */}
                        <thead>
                            <tr>
                                <th className="col-status">Status</th>
                                <th className="col-title">Title & Description</th>
                                <th className="col-progress">Sub-Tasks / Progress</th>
                                <th className="col-due">Due Date</th>
                                <th className="col-actions">Actions</th>
                            </tr>
                        </thead>
                        {/* Table Body */}
                        <tbody>
                            {tasks.map((task) => {
                                const progressPercent = calculateLocalProgress(task);
                                const hasSubtasks = Array.isArray(task.sub_tasks) && task.sub_tasks.length > 0;
                                const isClickable = hasSubtasks; // Row is clickable only if it has subtasks

                                return (
                                    <tr
                                        key={task.id}
                                        className={`
                                             task-row
                                             status-${task.status}
                                             ${highlightedTaskId === task.id ? "breathing-glow" : ""}
                                             ${isClickable ? 'clickable' : ''}
                                        `}
                                        // Open modal only if the row is meant to be clickable (has sub-tasks)
                                         onClick={() => isClickable && openModal(task)}
                                        title={isClickable ? 'Click to manage sub-tasks' : ''}
                                    >
                                        {/* Status Column */}
                                        <td className="col-status" onClick={(e) => e.stopPropagation()} > {/* Stop row click */}
                                            <input
                                                type="checkbox"
                                                checked={task.status === 'completed'}
                                                onChange={() => handleUpdateStatus(task.id, task.status)}
                                                className="task-status-checkbox"
                                                title={task.status === 'completed' ? 'Mark as Pending' : 'Mark as Completed'}
                                                aria-label={`Mark task ${task.title} as ${task.status === 'completed' ? 'Pending' : 'Completed'}`}
                                            />
                                        </td>
                                        {/* Title & Description Column */}
                                        <td className="col-title">
                                            <span className="task-title-text">{task.title}</span>
                                            {task.description && <p className="task-description-preview" title={task.description}>{task.description}</p>}
                                        </td>
                                        {/* Sub-Tasks / Progress Column */}
                                        <td className="col-progress">
                                             {task.status === 'completed' ? (
                                                 // Display simple "Completed" badge if main task is done
                                                 <span className="completed-badge">✔ Completed</span>
                                             ) : hasSubtasks ? (
                                                // Display progress if sub-tasks exist and main task is not completed
                                                <div className="subtask-progress">
                                                     <span className="subtask-count" title={`${task.sub_tasks.filter(st => st.status === 'completed').length} of ${task.sub_tasks.length} sub-tasks completed`}>
                                                         {task.sub_tasks.filter(st => st.status === 'completed').length} / {task.sub_tasks.length}
                                                     </span>
                                                     <progress value={progressPercent} max="100" title={`${progressPercent}% complete`}></progress>
                                                    {/* Button to open modal - make sure it works even if row isn't clickable overall */}
                                                     <button
                                                         className="manage-subtasks-btn"
                                                         onClick={(e) => { e.stopPropagation(); openModal(task); }} // Stop row click, open modal
                                                         title="Manage sub-tasks"
                                                         aria-label={`Manage sub-tasks for ${task.title}`}
                                                     >
                                                         Manage
                                                     </button>
                                                </div>
                                            ) : (
                                                // Display if no sub-tasks and main task is not completed
                                                <span className="no-subtasks">No sub-tasks</span>
                                            )}
                                        </td>
                                        {/* Due Date Column */}
                                        <td className="col-due">{task.due_date || 'N/A'}</td>
                                        {/* Actions Column */}
                                        <td className="col-actions" onClick={(e) => e.stopPropagation()} > {/* Stop row click */}
                                            <button
                                                onClick={() => handleDelete(task.id)}
                                                className="delete-btn"
                                                disabled={isLoading} // Disable while other actions might be loading
                                                title="Delete Task"
                                                aria-label={`Delete task ${task.title}`}
                                            >
                                                🗑️
                                            </button>
                                            {/* Add Edit button here later if needed */}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

             {/* Modal Display Area - Render the modal if a task is selected */}
            {selectedTaskForModal && (
                <SubTaskModal
                    task={selectedTaskForModal} // Pass the selected task data
                    onClose={closeModal} // Pass the function to close the modal
                    onSubTaskChange={handleSubTaskChangeCallback} // Pass the callback for when sub-tasks change
                />
            )}
        </div>
    );
};

export default StudentTasks;