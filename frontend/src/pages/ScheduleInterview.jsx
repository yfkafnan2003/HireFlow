
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

    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);

    if (!interviewerId || Number(interviewerId) < 1) {
      setError("Please enter a valid interviewer user ID.");
      return;
    }

    if (
      !startsAt ||
      !endsAt ||
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      setError("Please enter valid interview dates and times.");
      return;
    }

    if (startDate <= new Date()) {
      setError("The interview must be scheduled for a future time.");
      return;
    }

    if (endDate <= startDate) {
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
          starts_at: startDate.toISOString(),
          ends_at: endDate.toISOString(),
          meeting_link: meetingLink.trim() || null,
          notes: notes.trim() || null,
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
        <div>
          <Link to="/recruiter/dashboard">Dashboard</Link>
          <Link to="/recruiter/interviews">Manage Interviews</Link>
        </div>
      </nav>

      <section className="applications-container">
        <div className="applications-header">
          <h1>Schedule Interview</h1>
          <p>For Application #{applicationId}</p>
        </div>

        {error && (
          <div className="error-message" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label htmlFor="interviewerId">Interviewer User ID</label>
          <input
            id="interviewerId"
            type="number"
            min="1"
            value={interviewerId}
            onChange={(event) => setInterviewerId(event.target.value)}
            placeholder="Enter interviewer ID"
            required
          />

          <label htmlFor="startsAt">Start Date and Time</label>
          <input
            id="startsAt"
            type="datetime-local"
            value={startsAt}
            onChange={(event) => setStartsAt(event.target.value)}
            required
          />

          <label htmlFor="endsAt">End Date and Time</label>
          <input
            id="endsAt"
            type="datetime-local"
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
            required
          />

          <label htmlFor="meetingLink">Meeting Link (Optional)</label>
          <input
            id="meetingLink"
            type="url"
            value={meetingLink}
            onChange={(event) => setMeetingLink(event.target.value)}
            placeholder="https://meet.google.com/..."
          />

          <label htmlFor="notes">Notes (Optional)</label>
          <textarea
            id="notes"
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
