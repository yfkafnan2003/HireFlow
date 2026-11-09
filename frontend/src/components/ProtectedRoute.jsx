
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { apiRequest } from "../services/api";

function ProtectedRoute() {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    async function verifyToken() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setAuthenticated(false);
        return;
      }

      try {
        await apiRequest("/auth/me");
        setAuthenticated(true);
      } catch {
        localStorage.removeItem("access_token");
        setAuthenticated(false);
      }
    }

    verifyToken();
  }, []);

  if (authenticated === null) {
    return <p>Checking authentication...</p>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
