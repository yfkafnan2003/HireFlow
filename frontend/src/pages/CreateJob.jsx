
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

    if (loading) return;

    setLoading(true);

    try {
      await apiRequest("/jobs", {
        method: "POST",
        body: JSON.stringify({
          title: cleanTitle,
          description: cleanDescription,
          location: cleanLocation || null,
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
          <Link to="/recruiter/interviews">Manage Interviews</Link>
        </div>
      </nav>

      <section className="auth-container">
        <div className="auth-card">
          <p className="tagline">RECRUITER PORTAL</p>
          <h1>Create Job Posting</h1>
          <p className="auth-subtitle">
            Publish a new opportunity for candidates.
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <label htmlFor="title">Job Title</label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Junior Python Developer"
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
              placeholder="e.g. Dhaka, Bangladesh"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={150}
            />

            <label htmlFor="description">Job Description</label>
            <textarea
              id="description"
              placeholder="Describe the responsibilities and requirements..."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              minLength={10}
              rows={7}
              required
            />

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="primary-btn auth-submit"
              disabled={loading}
            >
              {loading ? "Publishing..." : "Publish Job"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default CreateJob;
