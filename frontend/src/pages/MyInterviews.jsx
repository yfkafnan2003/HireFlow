
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

function MyInterviews() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchInterviews() {
    setLoading(true);
    setError("");

    try {
      const userData = await apiRequest("/auth/me");

      if (userData.role === "recruiter") {
        navigate("/recruiter/dashboard");
        return;
      }

      setUser(userData);

      const endpoint =
        userData.role === "interviewer"
          ? "/interviews/assigned"
          : "/interviews/me";

      const data = await apiRequest(endpoint);
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

  function handleLogout() {
    localStorage.removeItem("access_token");
    navigate("/login");
  }

  if (loading) {
    return (
      <p className="loading-message" role="status">
        Loading interviews...
      </p>
    );
  }

  return (
    <main className="jobs-page">
      <nav>
        <Link
          to={user?.role === "interviewer" ? "/interviews" : "/dashboard"}
          className="brand-link"
        >
          HireFlow
        </Link>

        <div>
          {user?.role === "interviewer" ? (
            <Link to="/interviews">Assigned Interviews</Link>
          ) : (
            <>
              <Link to="/dashboard">Dashboard</Link>
            </>
          )}

          <button className="nav-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <section className="applications-container">
        <div className="applications-header">
          <h1>
            {user?.role === "interviewer"
              ? "Assigned Interviews"
              : "My Interviews"}
          </h1>

          <p>
            {user?.role === "interviewer"
              ? "View interviews assigned to you."
              : "View your upcoming and past interview schedule."}
          </p>
        </div>

        {error && (
          <div className="error-message" role="alert">
            <p>{error}</p>
            <button
              type="button"
              className="secondary-btn"
              onClick={fetchInterviews}
            >
              Try Again
            </button>
          </div>
        )}

        {!error && interviews.length === 0 && (
          <div className="empty-applications">
            <h2>No interviews scheduled</h2>
            <p>
              {user?.role === "interviewer"
                ? "Interviews assigned to you will appear here."
                : "When a recruiter schedules an interview for your application, it will appear here."}
            </p>
          </div>
        )}

        {!error && interviews.length > 0 && (
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

                <span className={`application-status ${interview.status}`}>
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
