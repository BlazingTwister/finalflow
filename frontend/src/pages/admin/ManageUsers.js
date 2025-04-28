import React, { useState, useEffect, useCallback } from "react";
import {
    fetchAdminUsers,
    deleteAdminUser,
    updateAdminUserRole,
    assignAdminSupervisor,
    fetchAdminLecturers
} from "../../api/api"; // Make sure path is correct
import "../../styles/manageUsers.css"; //
// You'll likely need a modal component for editing roles/supervisors
// import Modal from '../../components/Modal';

function ManageUsers() {
    const [usersData, setUsersData] = useState({ data: [], current_page: 1, last_page: 1 }); // Store pagination data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [lecturers, setLecturers] = useState([]);

    // --- State for Modals (Example) ---
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showSupervisorModal, setShowSupervisorModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); // User being edited
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedSupervisorId, setSelectedSupervisorId] = useState('');

    // Debounce function to delay API calls while typing
    const debounce = (func, delay) => {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    };

    // Fetch users function
    const loadUsers = useCallback(async (page = 1, search = searchTerm, role = roleFilter) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAdminUsers(search, role, page);
            setUsersData(data); // Set the whole pagination object
        } catch (err) {
            setError("Failed to fetch users. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, roleFilter]); // Dependencies for useCallback

    // Debounced version of loadUsers for search input
    const debouncedLoadUsers = useCallback(debounce(loadUsers, 500), [loadUsers]);

    // Initial load and load lecturers
    useEffect(() => {
        loadUsers(1); // Initial load on page 1
        const loadLecturers = async () => {
            try {
                const lects = await fetchAdminLecturers();
                setLecturers(lects);
            } catch (err) {
                console.error("Failed to fetch lecturers:", err);
                // Handle lecturer fetch error if needed
            }
        };
        loadLecturers();
    }, [loadUsers]); // Run once on mount and when loadUsers changes reference (shouldn't often)

    // Handle search input change
    const handleSearchChange = (event) => {
        const newSearchTerm = event.target.value;
        setSearchTerm(newSearchTerm);
        debouncedLoadUsers(1, newSearchTerm, roleFilter); // Reset to page 1 on new search
    };

    // Handle role filter change
    const handleRoleFilterChange = (event) => {
        const newRoleFilter = event.target.value;
        setRoleFilter(newRoleFilter);
        loadUsers(1, searchTerm, newRoleFilter); // Reset to page 1 on new filter
    };

     // Handle pagination change
    const handlePageChange = (page) => {
        if (page >= 1 && page <= usersData.last_page) {
            loadUsers(page);
        }
    };

    // --- Action Handlers ---

    const handleDelete = async (userId, userName) => {
        if (window.confirm(`Are you sure you want to remove ${userName}?`)) {
            setLoading(true);
            try {
                await deleteAdminUser(userId);
                // Refresh user list after delete
                loadUsers(usersData.current_page); // Reload current page
            } catch (err) {
                setError(`Failed to delete user ${userName}.`);
                setLoading(false); // Stop loading on error
            }
            // setLoading(false) // This will be handled by loadUsers finally block
        }
    };

    const openRoleModal = (user) => {
        setSelectedUser(user);
        setSelectedRole(user.user_role);
        setShowRoleModal(true);
    };

    const handleRoleChange = async () => {
        if (!selectedUser || !selectedRole) return;
        setLoading(true);
        setShowRoleModal(false);
        try {
            await updateAdminUserRole(selectedUser.id, selectedRole);
            loadUsers(usersData.current_page); // Reload current page
        } catch (err) {
             setError(`Failed to update role for ${selectedUser.fname}. ${err.response?.data?.message || ''}`);
             setLoading(false);
        }
        setSelectedUser(null);
    };

     const openSupervisorModal = (user) => {
        if (user.user_role !== 'student') return; // Only for students
        setSelectedUser(user);
        // Set initial supervisor ID, handle null correctly
         setSelectedSupervisorId(user.supervisor ? user.supervisor.id : '');
        setShowSupervisorModal(true);
    };

     const handleSupervisorAssign = async () => {
         if (!selectedUser) return;
         setLoading(true);
         setShowSupervisorModal(false);
         try {
             // Pass null if empty string selected (meaning unassign)
             const supervisorIdToAssign = selectedSupervisorId === '' ? null : Number(selectedSupervisorId);
             await assignAdminSupervisor(selectedUser.id, supervisorIdToAssign);
             loadUsers(usersData.current_page); // Reload current page
         } catch (err) {
             setError(`Failed to assign supervisor for ${selectedUser.fname}. ${err.response?.data?.message || ''}`);
             setLoading(false);
         }
         setSelectedUser(null);
    };


    return (
        <div className="dashboard-main manage-users-page"> {/* Add specific class */}
            <h1>👥 Manage Users</h1>

            {error && <div className="error-message">{error}</div>}

            {/* Search and Filter Controls */}
            <div className="controls">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                />
                <select value={roleFilter} onChange={handleRoleFilterChange} className="filter-select">
                    <option value="">All Roles</option>
                    <option value="student">Students</option>
                    <option value="lecturer">Lecturers</option>
                    <option value="admin">Admins</option>
                </select>
            </div>

            {loading && <div className="loading-spinner">Loading...</div>}

            {!loading && usersData.data.length === 0 && !error && (
                <p>No users found matching your criteria.</p>
            )}

            {!loading && usersData.data.length > 0 && (
                <>
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Supervisor</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersData.data.map(user => (
                                <tr key={user.id}>
                                    <td>{user.fname} {user.lname}</td>
                                    <td>{user.email}</td>
                                    <td>{user.user_role}</td>
                                     <td>
                                         {user.user_role === 'student' ? (
                                            user.supervisor ? `${user.supervisor.fname} ${user.supervisor.lname}` : <span className="unassigned">Not Assigned</span>
                                         ) : (
                                            'N/A' // Not applicable for non-students
                                         )}
                                     </td>
                                    <td className="action-buttons">
                                        <button onClick={() => openRoleModal(user)} className="action-btn edit-role-btn" title="Change Role">✏️ Role</button>
                                        {user.user_role === 'student' && (
                                            <button onClick={() => openSupervisorModal(user)} className="action-btn assign-supervisor-btn" title="Assign Supervisor">🧑‍🏫 Assign</button>
                                        )}
                                        <button onClick={() => handleDelete(user.id, `${user.fname} ${user.lname}`)} className="action-btn delete-btn" title="Remove User">🗑️ Remove</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className="pagination-controls">
                        <button
                            onClick={() => handlePageChange(usersData.current_page - 1)}
                            disabled={usersData.current_page === 1}
                        >
                            Previous
                        </button>
                        <span>Page {usersData.current_page} of {usersData.last_page}</span>
                        <button
                            onClick={() => handlePageChange(usersData.current_page + 1)}
                            disabled={usersData.current_page === usersData.last_page}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}

            {/* --- Modals (Example Structure - Implement using your Modal component) --- */}
             {showRoleModal && selectedUser && (
                 <div className="modal-backdrop"> {/* Basic Modal Example */}
                     <div className="modal-content">
                         <h3>Change Role for {selectedUser.fname} {selectedUser.lname}</h3>
                         <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                             <option value="student">Student</option>
                             <option value="lecturer">Lecturer</option>
                             <option value="admin">Admin</option>
                         </select>
                         <div className="modal-actions">
                            <button onClick={handleRoleChange} disabled={loading}>Save Role</button>
                            <button onClick={() => {setShowRoleModal(false); setSelectedUser(null);}} disabled={loading}>Cancel</button>
                         </div>
                     </div>
                 </div>
             )}

             {showSupervisorModal && selectedUser && (
                 <div className="modal-backdrop"> {/* Basic Modal Example */}
                     <div className="modal-content">
                         <h3>Assign Supervisor for {selectedUser.fname} {selectedUser.lname}</h3>
                         <select value={selectedSupervisorId} onChange={(e) => setSelectedSupervisorId(e.target.value)}>
                             <option value="">-- Unassign / Select Supervisor --</option>
                             {lecturers.map(lect => (
                                 <option key={lect.id} value={lect.id}>
                                     {lect.fname} {lect.lname}
                                 </option>
                             ))}
                         </select>
                          <div className="modal-actions">
                            <button onClick={handleSupervisorAssign} disabled={loading}>Assign Supervisor</button>
                            <button onClick={() => {setShowSupervisorModal(false); setSelectedUser(null);}} disabled={loading}>Cancel</button>
                          </div>
                     </div>
                 </div>
             )}

        </div>
    );
}

export default ManageUsers;