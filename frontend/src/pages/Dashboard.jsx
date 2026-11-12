
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await apiRequest("/auth/me");
        setUser(data);
      } catch {
        localStorage.removeItem("access_token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    navigate("/login");
  }

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <main className="dashboard-page">
      <nav>
        <h2>HireFlow</h2>

        <div>
          <Link to="/">Home</Link>
          <Link to="/jobs">Browse Jobs</Link>
          <button className="nav-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <section className="dashboard-header">
        <p className="tagline">CANDIDATE DASHBOARD</p>
        <h1>Welcome back!</h1>
        <p>Manage your job search and discover new opportunities.</p>
      </section>

      <section className="dashboard-container">
        <div className="dashboard-profile">
          <div>
            <h2>{user.email}</h2>
            <p>Account ID: {user.id}</p>
          </div>

          <span className="role-badge">{user.role}</span>
        </div>

        <h2 className="dashboard-section-title">Quick Actions</h2>

        <div className="dashboard-grid">
          <article className="dashboard-card">
            <h3>Find Jobs</h3>
            <p>Explore available job opportunities and find your next role.</p>
            <Link to="/jobs" className="primary-btn">
              Browse Jobs
            </Link>
          </article>

          <article className="dashboard-card">
            <h3>My Applications</h3>
            <p>Keep track of the jobs you have applied for.</p>
            <Link to="/applications" className="primary-btn">
              View Applications
            </Link>
          </article>

          <article className="dashboard-card">
            <h3>My Interviews</h3>
            <p>View and manage your upcoming interview schedule.</p>
            <span className="coming-soon">Coming soon</span>
          </article>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
