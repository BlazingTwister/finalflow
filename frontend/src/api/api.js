
import axios from 'axios';

// Your existing Axios instance setup
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000', // Your backend URL
    withCredentials: true, // Required for Sanctum CSRF
    // withXSRFToken: true, // Axios handles XSRF token automatically with withCredentials
    headers: {
        "Content-Type": "application/json", //
        "Accept": "application/json", //
    },
});

// --- CSRF Token Handling ---
// Fetch CSRF token function (keep as is, called before state-changing requests)
export const fetchCsrfToken = async () => {
    try {
        // Make sure the path matches your Laravel Sanctum setup
        await api.get('/sanctum/csrf-cookie'); //
        // console.log("CSRF cookie potentially set/refreshed.");
    } catch (error) {
         // Avoid crashing the app if this fails, but log it.
         // State-changing requests might fail later.
         console.error("Error fetching CSRF token:", error);
    }
};


// --- Auth Token Interceptor (Keep as is) ---
api.interceptors.request.use(config => {
    const token = localStorage.getItem("token"); //
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; //
    }
    // Ensure CSRF token is fetched before non-GET requests if needed implicitly
    // However, explicit calls in functions (like registerUser, loginUser) are safer.
    return config;
}, error => {
     // Pass on request errors
     return Promise.reject(error);
});


// --- Existing Auth Functions (Keep as is) ---
export const registerUser = async (formData) => { //
    try {
        await fetchCsrfToken(); //
        const response = await api.post('/api/register', formData); //
        return response.data;
    } catch (error) {
        console.error("Registration Error:", error.response?.data || error.message);
        throw error; // Re-throw for component handling
    }
};

export const loginUser = async (formData) => { //
    try {
        await fetchCsrfToken(); //
        const response = await api.post('/api/login', formData); //
        // Your existing token/user storing logic
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.auth_id); // Consider if auth_id is needed if you have the user object
        localStorage.setItem("userRole", response.data.user.user_role);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        console.log("Login successful, token stored.");
        return response.data;
    } catch (error) {
        console.error("Login Error:", error.response?.data || error.message);
        // Clear stored items on login failure? Maybe not, user might retry.
        throw error; // Re-throw for component handling
    }
};


export const logoutUser = async () => {
    try {
        await fetchCsrfToken(); // Ensure CSRF token is available for POST request
        const response = await api.post('/api/logout'); // Your Laravel logout route

        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        localStorage.removeItem("user");

        console.log("Logout successful, token removed.");
        return response.data;
    } catch (error) {
        console.error("Logout Error:", error.response?.data || error.message);
        throw error; // Allow component to handle it
    }
};


// --- Existing Task Functions (Adjust updateTaskStatus path and add CSRF) ---
export const addTask = async (taskData) => { //
    try {
        await fetchCsrfToken(); // Add CSRF fetch before POST
        // taskData includes title, description, due_date, and optionally sub_tasks array
        const response = await api.post('/api/tasks', taskData); // Matches api.php
        return response.data;
    } catch (error) {
        console.error("Error adding task:", error.response?.data || error.message);
        throw error;
    }
};

// Update MAIN task status (Using the specific status route from updated api.php)
export const updateTaskStatus = async (taskId, status) => { //
    try {
        await fetchCsrfToken(); // Add CSRF fetch before PATCH
         // Ensure the route matches api.php: /api/tasks/{task}/status
        const response = await api.patch(`/api/tasks/${taskId}/status`, { status }); // Updated route
        return response.data;
    } catch (error) {
        console.error("Error updating task status:", error.response?.data || error.message);
        throw error;
    }
};

export const fetchTasks = async () => { //
    try {
        const response = await api.get('/api/tasks'); // Matches api.php
        // Ensure nested sub_tasks are arrays if needed (backend should handle this ideally)
         const tasks = response.data.map(task => ({
             ...task,
             sub_tasks: Array.isArray(task.sub_tasks) ? task.sub_tasks : []
         }));
         return Array.isArray(tasks) ? tasks : [];
        // return Array.isArray(response.data) ? response.data : []; // Original return
    } catch (error) {
        console.error("Error fetching tasks:", error.response?.data || error.message);
        // Consider how to handle auth errors (e.g., 401 Unauthorized) - maybe redirect to login
        if (error.response?.status === 401) {
             // clearLocalStorage(); // Example function to clear auth data
             // window.location.href = '/login'; // Force redirect
             console.warn("Unauthorized fetching tasks. Token might be invalid or missing.");
        }
        return []; // Return empty array on error
    }
};

export const deleteTask = async (taskId) => { //
    try {
        await fetchCsrfToken(); // Add CSRF fetch before DELETE
        const response = await api.delete(`/api/tasks/${taskId}`); // Matches api.php
        return response.data;
    } catch (error) {
        console.error("Error deleting task:", error.response?.data || error.message);
        throw error;
    }
};

// --- NEW Sub-Task Functions ---
/**
 * Adds a sub-task to a specific parent task.
 * @param {number} taskId The ID of the parent task.
 * @param {object} subTaskData Object containing the sub-task details (e.g., { title: 'New Subtask' }).
 */
export const addSubTask = async (taskId, subTaskData) => {
    try {
        await fetchCsrfToken(); // CSRF for POST
         // Route matches api.php: /api/tasks/{task}/subtasks
        const response = await api.post(`/api/tasks/${taskId}/subtasks`, subTaskData);
        return response.data; // Expects { message: '...', sub_task: { ... } }
    } catch (error) {
        console.error("Error adding sub-task:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Updates the status of a specific sub-task.
 * @param {number} subTaskId The ID of the sub-task to update.
 * @param {string} status The new status ('pending' or 'completed').
 */
export const updateSubTaskStatus = async (subTaskId, status) => {
    try {
        await fetchCsrfToken(); // CSRF for PATCH
         // Route matches api.php: /api/subtasks/{subTask}/status
        const response = await api.patch(`/api/subtasks/${subTaskId}/status`, { status });
        // Expects { message: '...', sub_task: { ... }, parent_task_status: '...' }
        return response.data;
    } catch (error) {
         console.error("Error updating sub-task status:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Deletes a specific sub-task.
 * @param {number} subTaskId The ID of the sub-task to delete.
 */
export const deleteSubTask = async (subTaskId) => {
    try {
        await fetchCsrfToken(); // CSRF for DELETE
         // Route matches api.php: /api/subtasks/{subTask}
        const response = await api.delete(`/api/subtasks/${subTaskId}`);
        // Expects { message: '...', parent_task_status: '...' }
        return response.data;
    } catch (error) {
        console.error("Error deleting sub-task:", error.response?.data || error.message);
        throw error;
    }
};

// --- NEW Progress Function ---
/**
 * Fetches the overall task progress percentage for the logged-in user.
 */
export const fetchTaskProgress = async () => {
    try {
         // Route matches api.php: /api/tasks/progress
        const response = await api.get('/api/tasks/progress');
        return response.data; // Expects { progress: number }
    } catch (error) {
        console.error("Error fetching task progress:", error.response?.data || error.message);
         if (error.response?.status === 401) {
            // Handle unauthorized potentially
            console.warn("Unauthorized fetching progress.");
        }
         // Return a default object or re-throw
         return { progress: 0 }; // Default to 0% on error
        // throw error; // Or re-throw
    }
};

 // --- NEW User Fetch Function (used in updated Dashboard) ---
 /**
  * Fetches the details of the currently authenticated user.
  */
 export const fetchUser = async () => {
    try {
        // Route matches api.php: /api/user
        const response = await api.get('/api/user');
        return response.data; // Returns the user object
    } catch (error) {
        console.error("Error fetching user:", error.response?.data || error.message);
        if (error.response?.status === 401) {
             console.warn("Unauthorized fetching user details.");
            // Handle unauthorized, e.g., clear token, redirect to login
        }
        throw error; // Re-throw to allow component to handle (e.g., show login prompt)
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


// --- Messaging API Calls ---


/**
 * Fetch all messages for the authenticated user.
 */
export const fetchMessages = async () => {
    try {
        const response = await api.get('/api/messages');
        return response.data; // Should return an array of message objects
    } catch (error) {
        console.error("Error fetching messages:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Send a new message.
 * @param {Object} messageData - { recipient_id, subject, body }
 */
export const sendMessage = async (messageData) => {
    try {
        await fetchCsrfToken();
        const response = await api.post('/api/messages', messageData);
        return response.data; // Returns { message, message: { ... } }
    } catch (error) {
        console.error("Error sending message:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * Mark a message as read.
 * @param {number} messageId
 */
export const markMessageAsRead = async (messageId) => {
    try {
        const response = await api.patch(`/api/messages/${messageId}/read`);
        return response.data; // Returns { message: '...', updatedMessage: { ... } }
    } catch (error) {
        console.error("Error marking message as read:", error.response?.data || error.message);
        throw error;
    }
};


export default api;