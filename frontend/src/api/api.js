import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000', // Laravel backend URL
    withCredentials: true, // Required for CSRF token
    withXSRFToken: true, // Required for CSRF token
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

// Fetch CSRF token before making POST requests
export const fetchCsrfToken = async () => {
    await api.get('/sanctum/csrf-cookie');
};


/**
 * User Registeration
 **/ 
export const registerUser = async (formData) => {
    try {
        await fetchCsrfToken(); // Fetch CSRF token first
        const response = await api.post('/api/register', formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};


/** 
 *  Attach authentication token to all requests
 * */ 
api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});



/**
 *  User Login
 **/ 
export const loginUser = async (formData) => {
    try {
        await fetchCsrfToken(); // Fetch CSRF token first
        const response = await api.post('/api/login', formData);

        // Store token in localStorage
        localStorage.setItem("token", response.data.token); // Store token in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.auth_id);
        localStorage.setItem("userRole", response.data.user.user_role);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        return response.data;

    } catch (error) {
        throw error;
    }
};



/**
 *  Student Task Management
 **/ 

// Add a new task
export const addTask = async (taskData) => {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
};


// Update task status
export const updateTaskStatus = async (taskId, status) => {
    try {
        await fetchCsrfToken();
        const response = await api.patch(`/api/tasks/${taskId}`, { status });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get all tasks
export const fetchTasks = async () => {
    try {
        const response = await api.get('/api/tasks'); // Adjust endpoint as needed      
        return Array.isArray(response.data) ? response.data : [];; 
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
    }
};

// Delete a task
export const deleteTask = async (taskId) => {
    try {
        await fetchCsrfToken();
        const response = await api.delete(`/api/tasks/${taskId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// --- Admin User Management API Calls ---

/**
 * Fetch users with optional search and role filtering.
 * @param {string} [searchTerm] - Term to search by name/email.
 * @param {string} [roleFilter] - Role to filter by ('student', 'lecturer', 'admin').
 * @param {number} [page] - Page number for pagination.
 */
export const fetchAdminUsers = async (searchTerm = '', roleFilter = '', page = 1) => {
    try {
        const params = {};
        if (searchTerm) params.search = searchTerm;
        if (roleFilter) params.role = roleFilter;
        params.page = page; // Include page number

        const response = await api.get('/api/admin/users', { params });
        // The response from Laravel pagination includes 'data' array and pagination links/meta
        return response.data;
    } catch (error) {
        console.error("Error fetching users:", error);
        throw error; // Re-throw to handle in component
    }
};

/**
 * Delete a user by ID.
 * @param {number} userId - The ID of the user to delete.
 */
export const deleteAdminUser = async (userId) => {
    try {
        await fetchCsrfToken(); // Ensure CSRF token
        const response = await api.delete(`/api/admin/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting user:", error);
        throw error;
    }
};

/**
 * Update a user's role.
 * @param {number} userId - The ID of the user to update.
 * @param {string} userRole - The new role ('student', 'lecturer', 'admin').
 */
export const updateAdminUserRole = async (userId, userRole) => {
    try {
        await fetchCsrfToken(); // Ensure CSRF token
        const response = await api.patch(`/api/admin/users/${userId}/role`, { user_role: userRole });
        return response.data; // Contains updated user object
    } catch (error) {
        console.error("Error updating user role:", error);
        throw error;
    }
};

 /**
 * Assign a supervisor to a student.
 * @param {number} studentId - The ID of the student.
 * @param {number|null} supervisorId - The ID of the lecturer or null to unassign.
 */
export const assignAdminSupervisor = async (studentId, supervisorId) => {
    try {
        await fetchCsrfToken(); // Ensure CSRF token
        // Handle null supervisorId correctly in the payload
        const payload = { supervisor_id: supervisorId === null ? null : supervisorId };
        const response = await api.patch(`/api/admin/users/${studentId}/assign-supervisor`, payload);
        return response.data; // Contains updated student object with supervisor info
    } catch (error) {
        console.error("Error assigning supervisor:", error);
        throw error;
    }
};

/**
 * Fetch all users with the 'lecturer' role.
 */
export const fetchAdminLecturers = async () => {
    try {
        const response = await api.get('/api/admin/lecturers');
        return response.data; // Returns an array of lecturers {id, fname, lname}
    } catch (error) {
        console.error("Error fetching lecturers:", error);
        throw error;
    }
};


export default api;