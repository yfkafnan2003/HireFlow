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
      try {
        const data = await apiRequest("/jobs/my-jobs");
        const job = data.find((item) => item.id === Number(jobId));

        if (!job) {
          throw new Error("Job not found");
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

    setSaving(true);
    setError("");

    try {
      await apiRequest(`/jobs/${jobId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title,
          description,
          location: location || null,
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

  if (loading) {
    return <p>Loading job...</p>;
  }

  return (
    <main className="auth-page">
      <nav>
        <h2>HireFlow</h2>
        <div>
          <Link to="/recruiter/dashboard">Dashboard</Link>
          <Link to="/jobs">Browse Jobs</Link>
        </div>
      </nav>

      <section className="auth-container">
        <div className="auth-card">
          <p className="tagline">RECRUITER PORTAL</p>
          <h1>Edit Job Posting</h1>
          <p className="auth-subtitle">
            Update your job posting details.
          </p>

          {error && <p className="form-error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <label>Job Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              minLength={3}
              maxLength={200}
              required
            />

            <label>Location</label>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={150}
            />

            <label>Job Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              minLength={10}
              rows={7}
              required
            />

            <label>Job Status</label>
            <select
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
        </div>
      </section>
    </main>
  );
}

export default EditJob;