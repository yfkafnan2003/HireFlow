
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";

function EditJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [jobStatus, setJobStatus] = useState("open");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchJob() {
      setLoading(true);
      setError("");

      try {
        const data = await apiRequest("/jobs/my-jobs");
        const job = data.find((item) => item.id === Number(jobId));

        if (!job) {
          throw new Error("Job not found.");
        }

        setTitle(job.title);
        setDescription(job.description);
        setLocation(job.location || "");
        setJobStatus(job.status);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [jobId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    const cleanLocation = location.trim();

    if (cleanTitle.length < 3) {
      setError("Job title must contain at least 3 characters.");
      return;
    }

    if (cleanDescription.length < 10) {
      setError("Job description must contain at least 10 characters.");
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      await apiRequest(`/jobs/${jobId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: cleanTitle,
          description: cleanDescription,
          location: cleanLocation || null,
          status: jobStatus,
        }),
      });

      navigate("/recruiter/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="auth-page">
      <nav>
        <h2>HireFlow</h2>
        <div>
          <Link to="/recruiter/dashboard">Dashboard</Link>
          <Link to="/recruiter/interviews">Manage Interviews</Link>
        </div>
      </nav>

      <section className="auth-container">
        <div className="auth-card">
          <p className="tagline">RECRUITER PORTAL</p>
          <h1>Edit Job Posting</h1>
          <p className="auth-subtitle">
            Update your job posting details.
          </p>

          {loading && (
            <p className="loading-message" role="status">
              Loading job details...
            </p>
          )}

          {error && (
            <div className="error-message" role="alert">
              <p>{error}</p>
              {!loading && (
                <Link
                  to="/recruiter/dashboard"
                  className="secondary-btn"
                >
                  Back to Dashboard
                </Link>
              )}
            </div>
          )}

          {!loading && !error && (
            <form onSubmit={handleSubmit} className="auth-form">
              <label htmlFor="title">Job Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                minLength={3}
                maxLength={200}
                required
              />

              <label htmlFor="location">Location</label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                maxLength={150}
              />

              <label htmlFor="description">Job Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                minLength={10}
                rows={7}
                required
              />

              <label htmlFor="jobStatus">Job Status</label>
              <select
                id="jobStatus"
                value={jobStatus}
                onChange={(event) => setJobStatus(event.target.value)}
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>

              <button
                type="submit"
                className="primary-btn auth-submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

export default EditJob;
