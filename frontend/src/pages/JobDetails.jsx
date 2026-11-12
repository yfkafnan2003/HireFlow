import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchJob() {
      try {
        const data = await apiRequest(`/jobs/${jobId}`);
        setJob(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [jobId]);

  return (
    <main className="jobs-page">
      <nav>
        <h2>HireFlow</h2>
        <div>
          <Link to="/">Home</Link>
          <Link to="/jobs">Browse Jobs</Link>
        </div>
      </nav>

      <section className="job-details-container">
        <Link to="/jobs" className="back-link">
          ← Back to Jobs
        </Link>

        {loading && <p>Loading job details...</p>}

        {error && <p className="form-error">{error}</p>}

        {!loading && !error && job && (
          <article className="job-details-card">
            <span className="job-status">{job.status}</span>

            <h1>{job.title}</h1>

            <p className="job-location">
              {job.location || "Location not specified"}
            </p>

            <div className="job-details-divider" />

            <h2>Job Description</h2>

            <p className="full-job-description">{job.description}</p>

            <p className="job-meta">
              Posted: {new Date(job.created_at).toLocaleDateString()}
            </p>

            <button
            className="primary-btn"
            onClick={async () => {
                setApplicationMessage("");
                setError("");

                if (!localStorage.getItem("access_token")) {
                navigate("/login");
                return;
                }

                try {
                setApplying(true);

                await apiRequest("/applications", {
                    method: "POST",
                    body: JSON.stringify({ job_id: job.id }),
                });

                setApplicationMessage("Application submitted successfully!");
                } catch (err) {
                setError(err.message);
                } finally {
                setApplying(false);
                }
            }}
            disabled={applying || !!applicationMessage}
            >
            {applying
                ? "Applying..."
                : applicationMessage
                ? "Applied"
                : "Apply for This Job"}
            </button>

            {applicationMessage && (
            <p className="success-message">{applicationMessage}</p>
            )}
          </article>
        )}
      </section>
    </main>
  );
}

export default JobDetails;
