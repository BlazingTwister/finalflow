import React, { useState } from "react";
import "../../styles/manageRepository.css";

function ManageRepository() {
    const [search, setSearch] = useState("");
    const [selectedProject, setSelectedProject] = useState(null); // For viewing project details
    const [projects, setProjects] = useState([
        { id: 1, title: "AI-Based Crop Detection", author: "Mel", year: 2023, description: "Using AI to detect crop diseases." },
        { id: 2, title: "Smart Traffic System", author: "Stacy", year: 2022, description: "Automated traffic control using sensors." },
        {id: 3, title: "Blockchain for Secure Voting", author: "Nelly", year: 2021, description: "A secure voting system using blockchain." },
    ]);

    // Filter projects based on search input 
    const filteredProjects = projects.filter(project =>
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.author.toLowerCase().includes(search.toLowerCase()) ||
        project.year.toString().includes(search)
    );

    return (
        <div className="dashboard-main">
            <h1>📚 Manage Capstone Repository</h1>

            {/* Search Bar */}
            <input
                type="text"
                placeholder="Search projects by title, author, or year..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-bar"
            />

            <button className="add-btn">➕ Add New Project</button>

            {/* Project List */}
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
                    {filteredProjects.length > 0 ? (
                        filteredProjects.map(project => (
                            <tr key={project.id}>
                                <td>{project.title}</td>
                                <td>{project.author}</td>
                                <td>{project.year}</td>
                                <td>
                                    <button className="view-btn" onClick={() => setSelectedProject(project)}>🔍 View</button>
                                    <button className="edit-btn">✏️ Edit</button>
                                    <button className="delete-btn">🗑️ Remove</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="no-results">No matching projects found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* View Project Modal */}
            {selectedProject && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{selectedProject.title}</h2>
                        <p><strong>Author:</strong> {selectedProject.author}</p>
                        <p><strong>Year:</strong> {selectedProject.year}</p>
                        <p><strong>Description:</strong> {selectedProject.description}</p>
                        <button className="close-btn" onClick={() => setSelectedProject(null)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageRepository;
