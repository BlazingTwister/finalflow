import { useNavigate } from "react-router-dom";
import "../../styles/adminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-main">
        <h1>Welcome, Admin</h1>

        {/* Dashboard Cards */}
        <div className="admin-cards">
            <div className="admin-card">
                <h3>📌 Pending Requests</h3>
                <p>10 users waiting for approval</p>
            </div>
            <div className="admin-card">
                <h3>👥 Total Users</h3>
                <p>150 registered users</p>
            </div>
            <div className="admin-card">
                <h3>📊 Reports</h3>
                <p>View system activity</p>
            </div>
        </div>
    </div>

  );

}

export default AdminDashboard;