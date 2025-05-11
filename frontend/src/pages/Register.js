import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, fetchCsrfToken } from '../api/api'; // Import API functions
import '../styles/register.css';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fname: '',
        lname: '',
        email: '',
        password: '',
        password_confirmation: '',
        user_role: 'student',
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
            await registerUser(formData); // Call the registration API
            alert('Registration successful! You can now log in.');
            navigate('/login');
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <div className="register-container">
            <h2>Register</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="fname"
                    placeholder="First Name"
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="lname"
                    placeholder="Last Name"
                    onChange={handleChange}
                    required
                />
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
                <input
                    type="password"
                    name="password_confirmation"
                    placeholder="Confirm Password"
                    onChange={handleChange}
                    required
                />
                <select name="user_role" onChange={handleChange}>
                    <option value="student">Student</option>
                    <option value="lecturer">Lecturer</option>
                </select>
                <button type="submit">Register</button>
            </form>
            
            <p>Already have an account? <a href="/login">Log in</a></p>
        </div>
    );
}

export default Register;