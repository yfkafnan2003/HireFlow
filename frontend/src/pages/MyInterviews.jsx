
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";

function MyInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInterviews() {
      try {
        const data = await apiRequest("/interviews/me");
        setInterviews(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInterviews();
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
          <h1>My Interviews</h1>
          <p>View your upcoming and past interview schedule.</p>
        </div>

        {loading && <p>Loading interviews...</p>}

        {error && <p className="form-error">{error}</p>}

        {!loading && !error && interviews.length === 0 && (
          <div className="empty-applications">
            <h2>No interviews scheduled</h2>
            <p>
              When a recruiter schedules an interview for your application,
              it will appear here.
            </p>
          </div>
        )}

        {!loading && interviews.length > 0 && (
          <div className="applications-list">
            {interviews.map((interview) => (
              <article className="application-card" key={interview.id}>
                <div>
                  <h2>Interview #{interview.id}</h2>

                  <p>Application ID: {interview.application_id}</p>

                  <p>
                    Start: {new Date(interview.starts_at).toLocaleString()}
                  </p>

                  <p>
                    End: {new Date(interview.ends_at).toLocaleString()}
                  </p>

                  {interview.meeting_link && (
                    <p>
                      Meeting:{" "}
                      <a
                        href={interview.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Join Meeting
                      </a>
                    </p>
                  )}

                  {interview.notes && <p>Notes: {interview.notes}</p>}
                </div>

                <span
                  className={`application-status ${interview.status}`}
                >
                  {interview.status}
                </span>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default MyInterviews;
