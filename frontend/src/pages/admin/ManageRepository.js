import React, { useState } from "react";
import "../../styles/manageRepository.css";

function ManageRepository() {
    const [projects, setProjects] = useState([
        { id: 1, title: "AI-Based Crop Detection", author: "Mel", year: 2023 },
        { id: 2, title: "Smart Traffic System", author: "Stacy", year: 2022 },
    ]);

    return (
        <div className="dashboard-main">
            <h1>📚 Manage Capstone Repository</h1>
            <button className="add-btn">➕ Add New Project</button>
            <table className="repository-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Year</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {projects.map(project => (
                        <tr key={project.id}>
                            <td>{project.title}</td>
                            <td>{project.author}</td>
                            <td>{project.year}</td>
                            <td>
                                <button className="edit-btn">✏️ Edit</button>
                                <button className="delete-btn">🗑️ Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ManageRepository;
