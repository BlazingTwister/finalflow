import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, fetchCsrfToken } from '../api/api'; // Import API functions
import '../styles/login.css';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            await fetchCsrfToken(); // Fetch CSRF token first
            const response = await loginUser(formData); // Call the login API
            alert('Login successful!');

            // Get the redirection path from API response
            const redirectPath = response.redirect || "/login";
            
            // Save user info and token in local storage
            localStorage.setItem("user", JSON.stringify(response.user));
            
            // Redirect based on user role
            navigate(redirectPath);
        } catch (error) {
            setError(error.response?.data?.message || 'Login failed.');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    onChange={handleChange}
                    required
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    onChange={handleChange}
                    required
                />
                <button type="submit">Login</button>
            </form>
            <p>Don't have an account? <a href="/registeration">Register</a></p>
        </div>
    );
}

export default Login;