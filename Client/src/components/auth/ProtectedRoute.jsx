import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, company, admin, loading } = useContext(AuthContext);
  const location = useLocation();

  // Show spinner while auth status is loading
  if (loading) {
    return <LoadingSpinner />;
  }

  // Determine logged-in role
  let currentUserRole = null;
  if (admin) {
    currentUserRole = "admin";
  } else if (user) {
    currentUserRole = "user";
  } else if (company) {
    currentUserRole = "company";
  }

  const isAuthenticated = !!admin || !!user || !!company;

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Redirect to home if user's role is not allowed for this route
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUserRole)) {
    return <Navigate to="/" replace />;
  }

  // Verification redirect for company users
  if (
    currentUserRole === "company" &&
    company?.isVerified?.toLowerCase() !== "verified" &&
    location.pathname !== "/company/profile"
  ) {
    return <Navigate to="/company/profile" replace />;
  }

  // Verification redirect for normal users
  if (
    currentUserRole === "user" &&
    !user?.isVerified &&
    location.pathname !== "/user/profile"
  ) {
    return <Navigate to="/user/profile" replace />;
  }

  // Passed all checks — render nested routes
  return <Outlet />;
};

export default ProtectedRoute;
