import React, { useState } from "react";
import "../../styles/manageUsers.css";

function ManageUsers() {
    const [users, setUsers] = useState([
        { id: 1, name: "Jane Rollins", email: "jane.rollins@ashesi.edu.gh", role: "student" },
        { id: 2, name: "Danny Shawn", email: "danny.shawn@ashesi.edu.gh", role: "lecturer" },
    ]);

    return (
        <div className="dashboard-main">
            <h1>👥 Manage Users</h1>
            <table className="users-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <button className="delete-btn">🗑️ Remove</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ManageUsers;
