import EditJob from "./pages/EditJob";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Applications from "./pages/Applications";
import Applicants from "./pages/Applicants";
import ScheduleInterview from "./pages/ScheduleInterview";
import RecruiterInterviews from "./pages/RecruiterInterviews";
import EditInterview from "./pages/EditInterview";
import MyInterviews from "./pages/MyInterviews";
function NotFound() {
  return <h1>404 - Page Not Found</h1>;
}
import CreateJob from "./pages/CreateJob";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:jobId" element={<JobDetails />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />}/>
          <Route path="/recruiter/jobs/new" element={<CreateJob />} />
          <Route path="/recruiter/jobs/:jobId/edit" element={<EditJob />} />
          <Route path="/recruiter/jobs/:jobId/applicants" element={<Applicants />} />
          <Route path="/recruiter/applications/:applicationId/interview/new" element={<ScheduleInterview />}/>
          <Route path="/recruiter/interviews" element={<RecruiterInterviews />} />
          <Route path="/recruiter/interviews/:interviewId/edit" element={<EditInterview />} />
          <Route path="/interviews" element={<MyInterviews />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
