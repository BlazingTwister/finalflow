import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/sidebar.css";

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const role = localStorage.getItem("userRole");
        setUserRole(role);
    }, []);

    //Sidebar for Students
    const studentLinks = [
        { icon: "🏠", text: "Dashboard", path: "/student/dashboard" },
        { icon: "📩", text: "Messages", path: "/student/messaging" },
        { icon: "📌", text: "Project Tasks", path: "/student/tasks" },
        { icon: "📅", text: "Meetings", path: "/student/schedule" },
        { icon: "📚", text: "Capstone Repository", path: "/repository" }
    ];

    //Sidebar for Lecturers
    const lecturerLinks = [
        { icon: "🏠", text: "Dashboard", path: "/lecturer/dashboard" },
        { icon: "📩", text: "Messages", path: "/lecturer/messaging" },
        { icon: "📂", text: "Student Submissions", path: "/lecturer/submissions" },
        { icon: "📅", text: "Meetings", path: "/lecturer/schedule" },
        { icon: "📚", text: "Capstone Repository", path: "/repository" }
    ];

    //Sidebar for Admin
    const adminLinks = [
        { icon: "🏠", text: "Dashboard", path: "/admin/dashboard" },
        { icon: "👥", text: "Manage Users", path: "/admin/manage-users" },
        { icon: "📩", text: "User Requests", path: "/admin/user-requests" },
        { icon: "📊", text: "Reports", path: "/admin/reports" },
        { icon: "⚙️", text: "Settings", path: "/admin/settings" }
    ];

    const links = userRole === "student" ? studentLinks : userRole === "lecturer" ? lecturerLinks : adminLinks;

    return (
        <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
            <button className="toggle-btn" onClick={toggleSidebar}>
                {isOpen ? "❌" : "☰"}
            </button>
            <ul>
                {links.map(({ icon, text, path }) => (
                    <li key={text} onClick={() => navigate(path)}>
                        <span className="icon">{icon}</span>
                        {isOpen && <span className="text">{text}</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
