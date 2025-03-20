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

// Register user
export const registerUser = async (formData) => {
    try {
        await fetchCsrfToken(); // Fetch CSRF token first
        const response = await api.post('/api/register', formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};


// Login user
export const loginUser = async (formData) => {
    try {
        await fetchCsrfToken(); // Fetch CSRF token first
        const response = await api.post('/api/login', formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default api;