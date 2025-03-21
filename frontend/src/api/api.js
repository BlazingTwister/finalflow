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


export default api;