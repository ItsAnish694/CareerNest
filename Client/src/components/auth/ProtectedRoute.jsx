import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, company, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingSpinner />;
  }

  const isAuthenticated = user || company;
  const userRole = user?.role || company?.role;
  const isVerified = user?.isVerified || company?.isVerified === "Verified"; // User is boolean, Company is string

  if (!isAuthenticated) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    // Logged in but unauthorized role, redirect to a dashboard or home
    return <Navigate to="/" replace />;
  }

  // Special check for company verification status
  if (
    userRole === "company" &&
    company &&
    company.isVerified !== "Verified" &&
    window.location.pathname !== "/company/profile"
  ) {
    // If company is not verified, but trying to access non-profile pages, redirect to profile
    return <Navigate to="/company/profile" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
