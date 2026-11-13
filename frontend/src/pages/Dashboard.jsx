
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const userData = await apiRequest("/auth/me");

        if (userData.role === "recruiter") {
          navigate("/recruiter/dashboard");
          return;
        }

        if (userData.role === "interviewer") {
          navigate("/interviews");
          return;
        }

        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [navigate]);

  function handleLogout() {
    localStorage.removeItem("access_token");
    navigate("/login");
  }

  if (loading) {
    return (
      <p className="loading-message" role="status">
        Loading candidate dashboard...
      </p>
    );
  }

  if (error) {
    return (
      <div className="error-message" role="alert">
        <p>{error}</p>
        <button className="secondary-btn" onClick={() => window.location.reload()}>
          Try Again
        </button>
        <button className="secondary-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="dashboard-page">
      <nav>
        <Link to="/dashboard" className="brand-link">
          HireFlow
        </Link>
          <div>
            <Link to="/jobs">Browse Jobs</Link>
            <Link to="/applications">My Applications</Link>
            <Link to="/interviews">My Interviews</Link>
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
            <p>View your upcoming and past interview schedule.</p>
            <Link to="/interviews" className="primary-btn">
              View My Interviews
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
