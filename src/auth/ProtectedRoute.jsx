import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLE_DASHBOARD, DEFAULT_DASHBOARD } from "../enums/userRoles";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading EduTracker...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based gate
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // Redirect to the user's own dashboard instead of 403 page
    const redirectTo = ROLE_DASHBOARD[user.role] || DEFAULT_DASHBOARD;
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default ProtectedRoute;