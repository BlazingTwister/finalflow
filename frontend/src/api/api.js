import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000', // Laravel backend URL
    withCredentials: true, // Required for CSRF token
});

// Fetch CSRF token before making POST requests
export const fetchCsrfToken = async () => {
    await api.get('/sanctum/csrf-cookie');
};

// Register user
export const registerUser = async (formData) => {
    try {
        await fetchCsrfToken(); // Fetch CSRF token first
        const response = await api.post('/api/register', {
            username: formData.username,
            email: formData.email,
            passwd: formData.passwd,
            passwd_confirmation: formData.passwd_confirmation,
            user_role: formData.user_role,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default api;