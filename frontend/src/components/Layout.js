import React, { useState } from "react";
import { Outlet } from "react-router-dom"; // Import Outlet
import Sidebar from "./Sidebar"; // Adjust the path if needed

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="layout">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className={`content ${isSidebarOpen ? "shifted" : ""}`}>
                <Outlet /> {/* This ensures pages are rendered here */}
            </div>
        </div>
    );
};

export default Layout;
