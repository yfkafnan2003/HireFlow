
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";

function ScheduleInterview() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [interviewerId, setInterviewerId] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (new Date(endsAt) <= new Date(startsAt)) {
      setError("End time must be after start time.");
      return;
    }

    setLoading(true);

    try {
      await apiRequest("/interviews", {
        method: "POST",
        body: JSON.stringify({
          application_id: Number(applicationId),
          interviewer_id: Number(interviewerId),
          starts_at: new Date(startsAt).toISOString(),
          ends_at: new Date(endsAt).toISOString(),
          meeting_link: meetingLink || null,
          notes: notes || null,
        }),
      });

      navigate("/recruiter/interviews");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          <h1>Schedule Interview</h1>
          <p>For Application #{applicationId}</p>
        </div>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Interviewer User ID</label>
          <input
            type="number"
            min="1"
            value={interviewerId}
            onChange={(event) => setInterviewerId(event.target.value)}
            placeholder="Enter interviewer ID"
            required
          />

          <label>Start Date and Time</label>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
            required
          />

          <label>End Date and Time</label>
          <input
            type="datetime-local"
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
            required
          />

          <label>Meeting Link (Optional)</label>
          <input
            type="url"
            value={meetingLink}
            onChange={(event) => setMeetingLink(event.target.value)}
            placeholder="https://meet.google.com/..."
          />

          <label>Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Interview instructions or notes"
            rows="4"
          />

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
          >
            {loading ? "Scheduling..." : "Schedule Interview"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default ScheduleInterview;
