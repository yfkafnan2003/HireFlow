
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";

// Convert an API date into the format required by datetime-local.
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
          meeting_link: meetingLink || null,
          notes: notes || null,
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
        <Link to="/recruiter/interviews">Back to Interviews</Link>
      </nav>

      <section className="applications-container">
        <div className="applications-header">
          <h1>Edit Interview</h1>
          <p>Interview #{interviewId}</p>
        </div>

        {loading && <p>Loading interview...</p>}
        {error && <p className="form-error">{error}</p>}

        {!loading && !error && (
          <form onSubmit={handleSubmit} className="auth-form">
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

            <label>Meeting Link</label>
            <input
              type="url"
              value={meetingLink}
              onChange={(event) => setMeetingLink(event.target.value)}
              placeholder="https://meet.google.com/..."
            />

            <label>Notes</label>
            <textarea
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
