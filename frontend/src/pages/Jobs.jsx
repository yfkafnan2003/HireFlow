
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchJobs() {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (location.trim()) {
        params.append("location", location.trim());
      }

      const query = params.toString();
      const endpoint = query ? `/jobs?${query}` : "/jobs";

      const data = await apiRequest(endpoint);
      setJobs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  function handleSearch(event) {
    event.preventDefault();
    fetchJobs();
  }

  return (
    <main className="jobs-page">
      <nav>
        <h2>HireFlow</h2>

        <div>
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
        </div>
      </nav>

      <section className="jobs-header">
        <h1>Find Your Next Opportunity</h1>
        <p>Explore open positions and find a job that matches your goals.</p>
      </section>

      <section className="jobs-container">
        <form className="job-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search job title..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <input
            type="text"
            placeholder="Filter by location..."
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />

          <button type="submit">Search Jobs</button>
        </form>

        {loading && <p>Loading jobs...</p>}

        {error && <p className="form-error">{error}</p>}

        {!loading && !error && jobs.length === 0 && (
          <p className="empty-jobs">No open jobs found.</p>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <article className="job-card" key={job.id}>
                <span className="job-status">{job.status}</span>

                <h2>{job.title}</h2>

                <p className="job-location">
                  {job.location || "Location not specified"}
                </p>

                <p className="job-description">
                  {job.description.length > 160
                    ? `${job.description.slice(0, 160)}...`
                    : job.description}
                </p>

                <Link to={`/jobs/${job.id}`} className="primary-btn">
                  View Details
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Jobs;
