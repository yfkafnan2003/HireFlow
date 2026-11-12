import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function CreateJob() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await apiRequest("/jobs", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          location: location || null,
        }),
      });

      navigate("/recruiter/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          <h1>Create Job Posting</h1>
          <p className="auth-subtitle">
            Publish a new opportunity for candidates.
          </p>

          <form onSubmit={handleSubmit}>
            <label>Job Title</label>
            <input
              type="text"
              placeholder="e.g. Junior Python Developer"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              minLength={3}
              maxLength={200}
              required
            />

            <label>Location</label>
            <input
              type="text"
              placeholder="e.g. Dhaka, Bangladesh"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={150}
            />

            <label>Job Description</label>
            <textarea
              placeholder="Describe the responsibilities and requirements..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              minLength={10}
              rows={7}
              required
            />

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="primary-btn auth-submit"
              disabled={loading}
            >
              {loading ? "Creating..." : "Publish Job"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default CreateJob;