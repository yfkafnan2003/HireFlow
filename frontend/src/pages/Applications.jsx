
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchApplications() {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/applications/me");
      setApplications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <main className="jobs-page">
      <nav>
        <h2>HireFlow</h2>
        <div>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/jobs">Browse Jobs</Link>
        </div>
      </nav>

      <section className="applications-container">
        <div className="applications-header">
          <h1>My Applications</h1>
          <p>Track the status of the jobs you have applied for.</p>
        </div>

        {loading && (
          <p className="loading-message" role="status">
            Loading your applications...
          </p>
        )}

        {error && (
          <div className="error-message" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="secondary-btn"
              onClick={fetchApplications}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && applications.length === 0 && (
          <div className="empty-applications">
            <h2>No applications yet</h2>
            <p>You haven't applied for any jobs.</p>
            <Link to="/jobs" className="primary-btn">
              Browse Jobs
            </Link>
          </div>
        )}

        {!loading && !error && applications.length > 0 && (
          <div className="applications-list">
            {applications.map((application) => (
              <article
                className="application-card"
                key={application.id}
              >
                <div>
                  <h2>Application #{application.id}</h2>
                  <p>Job ID: {application.job_id}</p>
                  <p>
                    Applied:{" "}
                    {new Date(application.applied_at).toLocaleDateString()}
                  </p>
                </div>

                <span className={`application-status ${application.status}`}>
                  {application.status}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Applications;
