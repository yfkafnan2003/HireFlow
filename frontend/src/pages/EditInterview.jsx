
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";

function toLocalDateTime(value) {
  const date = new Date(value);
  const pad = (number) => String(number).padStart(2, "0");

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

function EditInterview() {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInterview() {
      try {
        const interviews = await apiRequest("/interviews/recruiter");

        const interview = interviews.find(
          (item) => item.id === Number(interviewId)
        );

        if (!interview) {
          throw new Error("Interview not found.");
        }

        if (interview.status !== "scheduled") {
          throw new Error("Only scheduled interviews can be edited.");
        }

        setStartsAt(toLocalDateTime(interview.starts_at));
        setEndsAt(toLocalDateTime(interview.ends_at));
        setMeetingLink(interview.meeting_link || "");
        setNotes(interview.notes || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchInterview();
  }, [interviewId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);

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

    setSaving(true);

    try {
      await apiRequest(`/interviews/${interviewId}`, {
        method: "PATCH",
        body: JSON.stringify({
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
      setSaving(false);
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
          <h1>Edit Interview</h1>
          <p>Interview #{interviewId}</p>
          <Link to="/recruiter/interviews">← Back to Interviews</Link>
        </div>

        {loading && (
          <p className="loading-message" role="status">
            Loading interview...
          </p>
        )}

        {error && (
          <div className="error-message" role="alert">
            <p>{error}</p>
            <Link
              to="/recruiter/interviews"
              className="secondary-btn"
            >
              Back to Interviews
            </Link>
          </div>
        )}

        {!loading && !error && (
          <form onSubmit={handleSubmit} className="auth-form">
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

            <label htmlFor="meetingLink">Meeting Link</label>
            <input
              id="meetingLink"
              type="url"
              value={meetingLink}
              onChange={(event) => setMeetingLink(event.target.value)}
              placeholder="https://meet.google.com/..."
            />

            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows="4"
              placeholder="Interview instructions or notes"
            />

            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

export default EditInterview;
