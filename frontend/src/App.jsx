
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";

import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Applications from "./pages/Applications";
import Applicants from "./pages/Applicants";

import CreateJob from "./pages/CreateJob";
import EditJob from "./pages/EditJob";

import ScheduleInterview from "./pages/ScheduleInterview";
import RecruiterInterviews from "./pages/RecruiterInterviews";
import EditInterview from "./pages/EditInterview";
import MyInterviews from "./pages/MyInterviews";

import ProtectedRoute from "./components/ProtectedRoute";

function NotFound() {
  return <h1>404 - Page Not Found</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:jobId" element={<JobDetails />} />

        {/* Candidate Routes */}
        <Route element={<ProtectedRoute allowedRoles={["candidate"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
        </Route>

        {/* Recruiter Routes */}
        <Route element={<ProtectedRoute allowedRoles={["recruiter"]} />}>
          <Route
            path="/recruiter/dashboard"
            element={<RecruiterDashboard />}
          />
          <Route path="/recruiter/jobs/new" element={<CreateJob />} />
          <Route
            path="/recruiter/jobs/:jobId/edit"
            element={<EditJob />}
          />
          <Route
            path="/recruiter/jobs/:jobId/applicants"
            element={<Applicants />}
          />
          <Route
            path="/recruiter/applications/:applicationId/interview/new"
            element={<ScheduleInterview />}
          />
          <Route
            path="/recruiter/interviews"
            element={<RecruiterInterviews />}
          />
          <Route
            path="/recruiter/interviews/:interviewId/edit"
            element={<EditInterview />}
          />
        </Route>

        {/* Candidate and Interviewer Routes */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["candidate", "interviewer"]} />
          }
        >
          <Route path="/interviews" element={<MyInterviews />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
