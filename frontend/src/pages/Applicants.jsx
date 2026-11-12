import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";

function Applicants() {
  const { jobId } = useParams();

  const [applications, setApplications] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function fetchApplications() {
      try {
        const data = await apiRequest(
          `/applications/recruiter/jobs/${jobId}`
        );

        setApplications(data);

        const statuses = {};
        data.forEach((application) => {
          statuses[application.id] = application.status;
        });

        setSelectedStatuses(statuses);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchApplications();
  }, [jobId]);

  async function updateStatus(applicationId) {
    setError("");
    setMessage("");
    setSavingId(applicationId);

    try {
      const updated = await apiRequest(
        `/applications/${applicationId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: selectedStatuses[applicationId],
          }),
        }
      );

      setApplications((current) =>
        current.map((application) =>
          application.id === applicationId ? updated : application
        )
      );

      setMessage(`Application #${applicationId} updated successfully.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <main className="jobs-page">
      <nav>
        <h2>HireFlow</h2>
        <div>
          <Link to="/recruiter/dashboard">Dashboard</Link>
          <Link to="/jobs">Browse Jobs</Link>
        </div>
      </nav>

      <section className="applications-container">
        <div className="applications-header">
          <h1>Job Applicants</h1>
          <p>Review and manage applications for Job #{jobId}.</p>
          <Link to="/recruiter/dashboard">← Back to Dashboard</Link>
        </div>

        {loading && <p>Loading applicants...</p>}

        {error && <p className="form-error">{error}</p>}

        {message && <p className="success-message">{message}</p>}

        {!loading && !error && applications.length === 0 && (
          <div className="empty-applications">
            <h2>No applicants yet</h2>
            <p>Applications for this job will appear here.</p>
          </div>
        )}

        {!loading && applications.length > 0 && (
          <div className="applications-list">
            {applications.map((application) => (
              <article className="application-card" key={application.id}>
                <div>
                  <h2>Application #{application.id}</h2>
                  <p>Candidate ID: {application.candidate_id}</p>
                  <p>
                    Applied:{" "}
                    {new Date(application.applied_at).toLocaleDateString()}
                  </p>

                  <label htmlFor={`status-${application.id}`}>
                    Application Status
                  </label>

                  <select
                    id={`status-${application.id}`}
                    value={selectedStatuses[application.id] || application.status}
                    onChange={(event) =>
                      setSelectedStatuses((current) => ({
                        ...current,
                        [application.id]: event.target.value,
                      }))
                    }
                  >
                    <option value="reviewing">Reviewing</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                  </select>

                  <button
                    className="primary-btn"
                    onClick={() => updateStatus(application.id)}
                    disabled={
                      savingId === application.id ||
                      selectedStatuses[application.id] === application.status
                    }
                  >
                    {savingId === application.id
                      ? "Saving..."
                      : "Update Status"}
                  </button>
                  {application.status === "shortlisted" && (
                    <Link
                        to={`/recruiter/applications/${application.id}/interview/new`}
                        className="primary-btn"
                    >
                        Schedule Interview
                    </Link>
                    )}
                </div>

                <span
                  className={`application-status ${application.status}`}
                >
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

export default Applicants;