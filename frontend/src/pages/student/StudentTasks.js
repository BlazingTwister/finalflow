import React, { useEffect, useState } from "react";
import { fetchTasks, addTask, updateTaskStatus, deleteTask } from "../../api/api";
import "../../styles/tasks.css";

const StudentTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({ title: "", description: "", due_date: "" });

    useEffect(() => {
        loadTasks();
    }, []);

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

            <div className="add-task">
                <input type="text" placeholder="Task Title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
                <input type="text" placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
                <input type="date" value={newTask.due_date} onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })} />
                <button onClick={handleAddTask}>➕ Add Task</button>
            </div>

            <ul>
                {tasks.length === 0 ? (
                    <p>No tasks available.</p>
                ) : (
                    tasks.map((task) => (
                        <li key={task.id}>
                            <span>{task.title} - {task.description} (Due: {task.due_date})</span>
                            <button onClick={() => handleUpdateStatus(task.id, "completed")}>✅ Complete</button>
                            <button onClick={() => handleDelete(task.id)}>🗑️ Delete</button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default StudentTasks;
