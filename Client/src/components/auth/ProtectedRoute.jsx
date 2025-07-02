import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, company, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  const isAuthenticated = !!user || !!company;
  const userRole = user ? "user" : company ? "company" : null;

  const isUserVerified = user?.isVerified;
  const isCompanyVerified = company?.isVerified === "Verified";

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  // Redirect unverified company
  if (
    userRole === "company" &&
    !isCompanyVerified &&
    location.pathname !== "/company/profile"
  ) {
    return <Navigate to="/company/profile" replace />;
  }

  // Redirect unverified user
  if (
    userRole === "user" &&
    !isUserVerified &&
    location.pathname !== "/user/profile"
  ) {
    return <Navigate to="/user/profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
