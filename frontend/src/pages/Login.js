import { useNavigate } from "react-router-dom";
import "../styles/login.css";

function Login() {
  const navigate = useNavigate(); // Hook for navigating between pages

  const handleSelect = (role) => {
    localStorage.setItem("userRole", role); // Save role in localStorage

    // Redirect to the correct dashboard
    if (role === "student") {
        navigate("/student/dashboard"); 
      } else if (role === "lecturer") {
        navigate("/lecturer/dashboard"); 
      } else if (role === "admin") {
        navigate("/admin/dashboard"); 
      }
    };

    return (
      <div className="login-container">
        <h2>Welcome to the Capstone System</h2>
        <p>Select your role to continue:</p>

        <div className="login-buttons">
          <button className="admin-btn" onClick={() => handleSelect("admin")}>
            I am Admin
          </button>
          <button className="student-btn" onClick={() => handleSelect("student")}>
            I am a Student
          </button>
          <button className="lecturer-btn" onClick={() => handleSelect("lecturer")}>
            I am a Lecturer
          </button>
        </div>
      </div>
    );

  }

export default Login;
