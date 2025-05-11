import React, { useState } from "react";
import "../../styles/userRequests.css";

function UserRequests() {
    const [requests, setRequests] = useState([
        { id: 1, name: "Rachel May", email: "raechel.may@ashesi.edu.gh", role: "student" },
        { id: 2, name: "Lawson Reggy", email: "lawson.reggy@ashesi.edu.gh", role: "lecturer" },
    ]);

    return (
        <div className="dashboard-main">
            <h1>📩 User Requests</h1>
            <table className="requests-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(request => (
                        <tr key={request.id}>
                            <td>{request.name}</td>
                            <td>{request.email}</td>
                            <td>{request.role}</td>
                            <td>
                                <button className="approve-btn">✅ Approve</button>
                                <button className="reject-btn">❌ Reject</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default UserRequests;
