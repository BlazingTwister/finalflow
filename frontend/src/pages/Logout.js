import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser, fetchCsrfToken } from '../api/api';

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        const logout = async () => {
            try {
                await fetchCsrfToken(); // Get CSRF token for protection
                await logoutUser(); // Call API to destroy token
                alert("You have been logged out.");
            } catch (error) {
                console.error("Logout error:", error);
                // alert("Logout failed.");
            } finally {
                navigate("/login"); // Redirect to login page
            }
        };

        logout();
    }, [navigate]);

    return null; // No UI needed
}

export default Logout;
