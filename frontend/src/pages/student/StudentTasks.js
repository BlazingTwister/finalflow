import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // NEW
import { fetchTasks, addTask, updateTaskStatus, deleteTask } from "../../api/api";
import "../../styles/tasks.css";

const StudentTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ title: "", description: "", due_date: "" });
    const [showForm, setShowForm] = useState(false);
    const location = useLocation(); // NEW
    const highlightTaskId = location.state?.highlightTaskId; // NEW
    const [highlightedTaskId, setHighlightedTaskId] = useState(null); // NEW

    useEffect(() => {
        loadTasks();
    }, []);

    
useEffect(() => {
    if (highlightTaskId) {
        // Step 1: Clear any previous highlight immediately
        setHighlightedTaskId(null);

        // Step 2: Small delay before anything happens (300ms)
        const delayTimer = setTimeout(() => {
            // Step 3: Start breathing glow
            setHighlightedTaskId(highlightTaskId);

            // Step 4: Remove highlight after breathing finishes (after 2 seconds)
            const breathingDuration = 2000; // match your CSS animation duration
            const clearTimer = setTimeout(() => {
                setHighlightedTaskId(null);
            }, breathingDuration);

            return () => clearTimeout(clearTimer);
        }, 300);

        return () => clearTimeout(delayTimer);
    }
}, [highlightTaskId]);

    const loadTasks = async () => {
        try {
            const data = await fetchTasks();
            setTasks(data);
        } catch (error) {
            console.error("Error fetching tasks:", error);
        }
    };

    const handleAddTask = async () => {
        try {
            await addTask(newTask);
            setNewTask({ title: "", description: "", due_date: "" });
            setShowForm(false);
            loadTasks();
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const handleUpdateStatus = async (taskId, status) => {
        try {
            await updateTaskStatus(taskId, status);
            loadTasks();
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };

    const handleDelete = async (taskId) => {
        try {
            await deleteTask(taskId);
            loadTasks();
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    return (
        <div className="tasks-container">
            <h2>📌 Your Tasks</h2>

            {/* Button to show/hide add task form */}
            <button className="toggle-form-btn" onClick={() => setShowForm(!showForm)}>
                {showForm ? "✖ Hide Form" : "➕ Add New Task"}
            </button>

            {/* Task Form */}
            {showForm && (
                <div className="add-task">
                    <input
                        type="text"
                        placeholder="Task Title"
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Description"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                    <input
                        type="date"
                        value={newTask.due_date}
                        onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    />
                    <button onClick={handleAddTask}>✅ Save Task</button>
                </div>
            )}

            {/* Task List */}
            <ul className="task-list">
                {tasks.length === 0 ? (
                    <p className="no-tasks">No tasks available.</p>
                ) : (
                    tasks.map((task) => (
                        <li
                            key={task.id}
                            className={`task-item ${highlightedTaskId === task.id ? "breathing-glow" : ""}`}
                        >
                            <div className="task-info">
                                <h4>
                                    {task.title}
                                    {task.status === "completed" && (
                                        <span className="completed-tag">✔ Completed</span>
                                    )}
                                </h4>
                                <p>{task.description}</p>
                                <span className="due-date">📅 Due: {task.due_date}</span>
                            </div>
                            <div className="task-actions">
                                {task.status !== "completed" && (
                                    <button
                                        onClick={() => handleUpdateStatus(task.id, "completed")}
                                        className="complete-btn"
                                    >
                                        ✅ Complete
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(task.id)}
                                    className="delete-btn"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default StudentTasks;
