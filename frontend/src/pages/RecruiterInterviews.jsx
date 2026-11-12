
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../services/api";

function RecruiterInterviews() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  async function fetchInterviews() {
    try {
      const data = await apiRequest("/interviews/recruiter");
      setInterviews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInterviews();
  }, []);

  async function cancelInterview(interviewId) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this interview?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");
    setCancellingId(interviewId);

    try {
      await apiRequest(`/interviews/${interviewId}/cancel`, {
        method: "PATCH",
      });

      setMessage(`Interview #${interviewId} cancelled successfully.`);
      await fetchInterviews();
    } catch (err) {
      setError(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <main className="jobs-page">
      <nav>
        <h2>HireFlow</h2>
        <Link to="/recruiter/dashboard">Dashboard</Link>
      </nav>

      <section className="applications-container">
        <div className="applications-header">
          <h1>Interview Management</h1>
          <p>View and manage interviews for your jobs.</p>
        </div>

        {loading && <p>Loading interviews...</p>}
        {error && <p className="form-error">{error}</p>}
        {message && <p className="success-message">{message}</p>}

        {!loading && interviews.length === 0 && (
          <div className="empty-applications">
            <h2>No interviews scheduled</h2>
            <p>Scheduled interviews will appear here.</p>
          </div>
        )}

        {!loading && interviews.length > 0 && (
          <div className="applications-list">
            {interviews.map((interview) => (
              <article className="application-card" key={interview.id}>
                <div>
                  <h2>Interview #{interview.id}</h2>
                  <p>Application ID: {interview.application_id}</p>
                  <p>Interviewer ID: {interview.interviewer_id}</p>
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

                <div>
                  <span
                    className={`application-status ${interview.status}`}
                  >
                    {interview.status}
                  </span>
                    {interview.status === "scheduled" && (
                    <>
                        <Link
                        to={`/recruiter/interviews/${interview.id}/edit`}
                        className="primary-btn"
                        >
                        Edit Interview
                        </Link>

                        <button
                        className="primary-btn"
                        onClick={() => cancelInterview(interview.id)}
                        disabled={cancellingId === interview.id}
                        >
                        {cancellingId === interview.id
                            ? "Cancelling..."
                            : "Cancel Interview"}
                        </button>
                    </>
                    )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default RecruiterInterviews;
