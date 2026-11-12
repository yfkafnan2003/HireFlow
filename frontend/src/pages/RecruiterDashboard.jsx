import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function RecruiterDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [userData, jobsData] = await Promise.all([
          apiRequest("/auth/me"),
          apiRequest("/jobs/my-jobs"),
        ]);

        setUser(userData);
        setJobs(jobsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  function handleLogout() {
    localStorage.removeItem("access_token");
    navigate("/login");
  }

  if (loading) {
    return <p>Loading recruiter dashboard...</p>;
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }

  return (
    <main className="dashboard-page">
    <nav>
    <h2>HireFlow</h2>
    <div>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/jobs">Browse Jobs</Link>
        <Link to="/recruiter/interviews">Manage Interviews</Link>
    </div>
    </nav>
      <section className="dashboard-header">
        <p className="tagline">RECRUITER DASHBOARD</p>
        <h1>Welcome back!</h1>
        <p>Manage your job postings and recruitment activities.</p>
      </section>

      <section className="dashboard-container">
        <div className="dashboard-profile">
          <div>
            <h2>{user.email}</h2>
            <p>Account ID: {user.id}</p>
          </div>

          <span className="role-badge">{user.role}</span>
        </div>

        <div className="recruiter-stats">
          <article className="dashboard-card">
            <h3>Total Jobs</h3>
            <p className="stat-number">{jobs.length}</p>
          </article>

          <article className="dashboard-card">
            <h3>Open Jobs</h3>
            <p className="stat-number">
              {jobs.filter((job) => job.status === "open").length}
            </p>
          </article>

          <article className="dashboard-card">
            <h3>Closed Jobs</h3>
            <p className="stat-number">
              {jobs.filter((job) => job.status === "closed").length}
            </p>
          </article>
        </div>

        <div className="recruiter-jobs-header">
          <h2>My Job Postings</h2>
          <Link to="/recruiter/jobs/new" className="primary-btn">
            + Create Job
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="empty-applications">
            <h2>No jobs posted yet</h2>
            <p>Create your first job posting to get started.</p>
          </div>
        ) : (
          <div className="applications-list">
            {jobs.map((job) => (
              <article className="application-card" key={job.id}>
                <div>
                  <h2>{job.title}</h2>
                  <p>{job.location || "Location not specified"}</p>
                  <p>
                    Posted: {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="recruiter-job-actions">
                <Link
                to={`/recruiter/jobs/${job.id}/applicants`}
                className="primary-btn"
                >
                View Applicants
                </Link>
                <span className={`application-status ${job.status}`}>
                    {job.status}
                </span>

                <Link
                    to={`/recruiter/jobs/${job.id}/edit`}
                    className="primary-btn"
                >
                    Edit
                </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default RecruiterDashboard;