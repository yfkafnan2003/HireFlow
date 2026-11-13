
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { apiRequest } from "../services/api";

function ProtectedRoute({ allowedRoles }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    async function verifyToken() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        const currentUser = await apiRequest("/auth/me");
        setUser(currentUser);
        setAuthenticated(true);
      } catch {
        localStorage.removeItem("access_token");
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    verifyToken();
  }, []);

  if (loading) {
    return (
      <p className="loading-message" role="status">
        Checking authentication...
      </p>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (user?.role === "recruiter") {
      return <Navigate to="/recruiter/dashboard" replace />;
    }

    if (user?.role === "interviewer") {
      return <Navigate to="/interviews" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
