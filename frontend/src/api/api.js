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
export const fetchCsrfToken = async () => {
    try {
        await api.get('/sanctum/csrf-cookie');
    } catch (error) {
         console.error("Error fetching CSRF token:", error.response?.data || error.message, error);
         // It's important to understand why this might fail.
         // If it's consistent, requests requiring CSRF will fail.
    }
};


// --- Auth Token Interceptor ---
api.interceptors.request.use(async config => { // Make interceptor async
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // For non-GET requests, ensure CSRF token is fresh.
    // This is a more robust way than calling fetchCsrfToken before every single POST/PATCH etc.
    // However, for login/register, explicit call is still good as no token exists yet.
    if (config.method && config.method.toLowerCase() !== 'get' && !config.url.includes('/sanctum/csrf-cookie')) {
        // Check if it's not a GET request and not the CSRF request itself
        // You might want to refine this logic based on specific needs
        // For instance, only call it if a certain amount of time has passed since the last call.
        // For simplicity here, we call it.
        // await fetchCsrfToken(); // Consider implications of awaiting here for all non-GET requests.
                                // It might be better to call fetchCsrfToken explicitly in each state-changing API function.
                                // The current implementation in individual functions is generally safer.
    }
    return config;
}, error => {
     return Promise.reject(error);
});


// --- Existing Auth Functions (registerUser, loginUser - keep explicit fetchCsrfToken) ---
export const registerUser = async (formData) => {
    try {
        await fetchCsrfToken();
        const response = await api.post('/api/register', formData);
        return response.data;
    } catch (error) {
        console.error("Registration Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const loginUser = async (formData) => {
    try {
        await fetchCsrfToken();
        const response = await api.post('/api/login', formData);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userId", response.data.user.id); // Store user ID from user object
        localStorage.setItem("userRole", response.data.user.user_role);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        console.log("Login successful, token stored.");
        return response.data;
    } catch (error) {
        console.error("Login Error:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const logoutUser = async () => {
    try {
        await fetchCsrfToken();
        await api.post('/api/logout');
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        localStorage.removeItem("user");
        console.log("Logout successful, local storage cleared.");
    } catch (error) {
        console.error("Logout Error:", error.response?.data || error.message);
        // Still clear local storage on error to ensure logged out state
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        localStorage.removeItem("user");
        throw error.response?.data || error;
    }
};


// --- Existing Task Functions (addTask, updateTaskStatus, fetchTasks, deleteTask) ---
// --- Ensure fetchCsrfToken() is called before state-changing requests (POST, PATCH, DELETE) ---
export const addTask = async (taskData) => {
    try {
        await fetchCsrfToken();
        const response = await api.post('/api/tasks', taskData);
        return response.data;
    } catch (error) {
        console.error("Error adding task:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const updateTaskStatus = async (taskId, status) => {
    try {
        await fetchCsrfToken();
        const response = await api.patch(`/api/tasks/${taskId}/status`, { status });
        return response.data;
    } catch (error) {
        console.error("Error updating task status:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const fetchTasks = async () => {
    try {
        const response = await api.get('/api/tasks');
         const tasks = response.data.map(task => ({
             ...task,
             sub_tasks: Array.isArray(task.sub_tasks) ? task.sub_tasks : []
         }));
         return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
        console.error("Error fetching tasks:", error.response?.data || error.message);
        if (error.response?.status === 401) console.warn("Unauthorized fetching tasks.");
        return [];
    }
};

export const deleteTask = async (taskId) => {
    try {
        await fetchCsrfToken();
        const response = await api.delete(`/api/tasks/${taskId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting task:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// --- Sub-Task Functions (ensure CSRF) ---
export const addSubTask = async (taskId, subTaskData) => {
    try {
        await fetchCsrfToken();
        const response = await api.post(`/api/tasks/${taskId}/subtasks`, subTaskData);
        return response.data;
    } catch (error) {
        console.error("Error adding sub-task:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};
export const updateSubTaskStatus = async (subTaskId, status) => {
    try {
        await fetchCsrfToken();
        const response = await api.patch(`/api/subtasks/${subTaskId}/status`, { status });
        return response.data;
    } catch (error) {
         console.error("Error updating sub-task status:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};
export const deleteSubTask = async (subTaskId) => {
    try {
        await fetchCsrfToken();
        const response = await api.delete(`/api/subtasks/${subTaskId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting sub-task:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

// --- Progress Function ---
export const fetchTaskProgress = async () => {
    try {
        const response = await api.get('/api/tasks/progress');
        return response.data;
    } catch (error) {
        console.error("Error fetching task progress:", error.response?.data || error.message);
        if (error.response?.status === 401) console.warn("Unauthorized fetching progress.");
         return { progress: 0 };
    }
};

 // --- User Fetch Function ---
 export const fetchUser = async () => {
    try {
        const response = await api.get('/api/user');
        return response.data;
    } catch (error) {
        console.error("Error fetching user:", error.response?.data || error.message);
        if (error.response?.status === 401) console.warn("Unauthorized fetching user details.");
        throw error.response?.data || error;
    }
};


// --- Admin User Management API Calls (ensure CSRF for state-changing) ---
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

export const updateAdminUserRole = async (userId, userRole) => {
    try {
        await fetchCsrfToken();
        const response = await api.patch(`/api/admin/users/${userId}/role`, { user_role: userRole });
        return response.data;
    } catch (error) { /* ... */ throw error.response?.data || error; }
};
export const assignAdminSupervisor = async (studentId, supervisorId) => {
    try {
        await fetchCsrfToken();
        const payload = { supervisor_id: supervisorId === null ? null : supervisorId };
        const response = await api.patch(`/api/admin/users/${studentId}/assign-supervisor`, payload);
        return response.data;
    } catch (error) { /* ... */ throw error.response?.data || error; }
};
export const fetchAdminLecturers = async () => { /* ... */ };


// --- LECTURER SUBMISSION SLOT MANAGEMENT (from your uploaded api.js) ---
// (fetchLecturerSubmissionSlots, createSubmissionSlot, fetchLecturerSubmissionSlotDetails, updateSubmissionSlot, deleteSubmissionSlot, postSlotToStudents, fetchLecturerStudents)
// Ensure all state-changing ones (create, update, delete, post) call await fetchCsrfToken();

export const fetchLecturerSubmissionSlots = async () => {
    // No CSRF needed for GET
    try {
        const response = await api.get('/api/lecturer/submission-slots');
        return response.data;
    } catch (error) {
        console.error("Error fetching lecturer submission slots:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const createSubmissionSlot = async (slotData) => {
    try {
        await fetchCsrfToken();
        const response = await api.post('/api/lecturer/submission-slots', slotData);
        return response.data;
    } catch (error) {
        console.error("Error creating submission slot:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const fetchLecturerSubmissionSlotDetails = async (slotId) => {
    // No CSRF needed for GET
    try {
        const response = await api.get(`/api/lecturer/submission-slots/${slotId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching details for submission slot ${slotId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const updateSubmissionSlot = async (slotId, slotData) => {
    try {
        await fetchCsrfToken();
        // Laravel treats PUT and PATCH similarly for resource controllers if defined with Route::resource or Route::apiResource
        // If your route is specifically Route::put, then this is fine.
        const response = await api.put(`/api/lecturer/submission-slots/${slotId}`, slotData);
        return response.data;
    } catch (error) {
        console.error(`Error updating submission slot ${slotId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const deleteSubmissionSlot = async (slotId) => {
    try {
        await fetchCsrfToken();
        const response = await api.delete(`/api/lecturer/submission-slots/${slotId}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting submission slot ${slotId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const postSlotToStudents = async (slotId, assignmentData) => {
    try {
        await fetchCsrfToken();
        const response = await api.post(`/api/lecturer/submission-slots/${slotId}/post`, assignmentData);
        return response.data;
    } catch (error) {
        console.error(`Error posting slot ${slotId} to students:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

export const fetchLecturerStudents = async () => {
    // No CSRF needed for GET
    try {
        const response = await api.get('/api/lecturer/submission-slots/students');
        return response.data;
    } catch (error) {
        console.error("Error fetching lecturer's students:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};


// --- NEW LECTURER ACTIONS ON STUDENT SUBMISSIONS ---
/**
 * Acknowledge a student's submission.
 * @param {number} studentSubmissionId - The ID of the StudentSubmission record.
 */
export const acknowledgeStudentSubmission = async (studentSubmissionId) => {
    try {
        await fetchCsrfToken();
        const response = await api.patch(`/api/lecturer/student-submissions/${studentSubmissionId}/acknowledge`);
        return response.data; // Expects { message: '...', submission: { ... } }
    } catch (error) {
        console.error(`Error acknowledging submission ${studentSubmissionId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Add/Update a comment on a student's submission.
 * @param {number} studentSubmissionId - The ID of the StudentSubmission record.
 * @param {object} commentData - { comment: "Your comment text" }
 */
export const commentOnStudentSubmission = async (studentSubmissionId, commentData) => {
    try {
        await fetchCsrfToken();
        const response = await api.post(`/api/lecturer/student-submissions/${studentSubmissionId}/comment`, commentData);
        return response.data; // Expects { message: '...', submission: { ... } }
    } catch (error) {
        console.error(`Error commenting on submission ${studentSubmissionId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Download a file submitted by a student.
 * @param {number} submissionFileId - The ID of the SubmissionFile record.
 */
export const downloadSubmissionFile = async (submissionFileId) => {
    try {
        // No CSRF needed for GET (download)
        // The response should be a blob or trigger a download
        const response = await api.get(`/api/lecturer/submission-files/${submissionFileId}/download`, {
            responseType: 'blob', // Important for file downloads
        });
        // Create a link and trigger download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        // Try to get filename from Content-Disposition header
        const contentDisposition = response.headers['content-disposition'];
        let filename = `submission_file_${submissionFileId}`; // Default filename
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
            if (filenameMatch && filenameMatch.length > 1) {
                filename = filenameMatch[1];
            }
        }
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        return { success: true, message: 'File download initiated.' };
    } catch (error) {
        console.error(`Error downloading file ${submissionFileId}:`, error.response?.data || error.message);
        // If responseType is blob, error.response.data might be a blob that needs to be parsed
        // For simplicity, we'll throw a generic error or the error object if available.
        if (error.response && error.response.data instanceof Blob) {
            const errText = await error.response.data.text();
            const errJson = JSON.parse(errText);
            console.error("Error from server (blob):", errJson);
            throw errJson || error;
        }
        throw error.response?.data || error;
    }
};


// --- NEW STUDENT SUBMISSION FUNCTIONS ---
/**
 * Fetch submission slots assigned to the current student.
 */
export const fetchStudentAssignedSlots = async () => {
    try {
        // No CSRF needed for GET
        const response = await api.get('/api/student/submission-slots');
        return response.data; // Expects an array of slot objects with submission details
    } catch (error) {
        console.error("Error fetching student assigned slots:", error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Submit files for a specific submission slot.
 * @param {number} slotId - The ID of the submission slot.
 * @param {FormData} formData - FormData object containing the files under the key 'files[]'.
 */
export const submitStudentWork = async (slotId, formData) => {
    try {
        await fetchCsrfToken();
        // When sending FormData, Content-Type header is set automatically by browser with boundary
        // So, remove the default 'application/json' for this specific request.
        const response = await api.post(`/api/student/submission-slots/${slotId}/submit`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // Expects { message: '...', submission_details: {...} }
    } catch (error) {
        console.error(`Error submitting work for slot ${slotId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};

/**
 * Fetch details of a specific submission made by the student.
 * @param {number} studentSubmissionId - The ID of the student's submission.
 */
export const fetchMyStudentSubmissionDetails = async (studentSubmissionId) => {
    try {
        const response = await api.get(`/api/student/submission-slots/my-submissions/${studentSubmissionId}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching student submission ${studentSubmissionId}:`, error.response?.data || error.message);
        throw error.response?.data || error;
    }
};


export default api;
