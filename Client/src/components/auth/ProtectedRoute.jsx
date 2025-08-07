import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, company, admin, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  let currentUserRole = null;
  if (admin) {
    currentUserRole = "admin";
  } else if (user) {
    currentUserRole = "user";
  } else if (company) {
    currentUserRole = "company";
  }

  const isAuthenticated = !!admin || !!user || !!company;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUserRole)) {
    return <Navigate to="/" replace />;
  }

  if (
    currentUserRole === "company" &&
    company?.isVerified?.toLowerCase() !== "verified" &&
    location.pathname !== "/company/profile"
  ) {
    return <Navigate to="/company/profile" replace />;
  }

  if (
    currentUserRole === "user" &&
    !user?.isVerified &&
    location.pathname !== "/user/profile"
  ) {
    return <Navigate to="/user/profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
