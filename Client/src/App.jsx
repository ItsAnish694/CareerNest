import React, { useContext, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/common/Header";
import Footer from "./components/common/Footer";

import RegisterUser from "./pages/user/RegisterUser";
import VerifyUser from "./pages/user/VerifyUser";
import Login from "./pages/auth/Login";
import UserProfile from "./pages/user/UserProfile";
import JobListing from "./pages/user/JobListing";
import JobDetails from "./pages/user/JobDetails";
import AppliedJobs from "./pages/user/AppliedJobs";
import BookmarkedJobs from "./pages/user/BookmarkedJobs";
import UpdateUserSkills from "./pages/user/UpdateUserSkills";
import UpdateUserProfileInfo from "./pages/user/UpdateUserProfileInfo";
import UpdateUserPassword from "./pages/user/UpdateUserPassword";
import UpdateUserEmail from "./pages/user/UpdateUserEmail";
import NotificationsPage from "./pages/user/NotificationsPage";
import VerifyUserEmail from "./pages/user/VerifyUserEmail";

import RegisterCompany from "./pages/company/RegisterCompany";
import VerifyCompany from "./pages/company/VerifyCompany";
import CompanyProfile from "./pages/company/CompanyProfile";
import UpdateCompanyProfileInfo from "./pages/company/UpdateCompanyProfileInfo";
import UpdateCompanyPassword from "./pages/company/UpdateCompanyPassword";
import UpdateCompanyEmail from "./pages/company/UpdateCompanyEmail";
import VerifyCompanyEmail from "./pages/company/VerifyCompanyEmail";
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyJobPostings from "./pages/company/CompanyJobPostings";
import CreateJobPosting from "./pages/company/CreateJobPosting";
import JobApplications from "./pages/company/JobApplications";
import UpdateCompanyLogo from "./pages/company/UpdateCompanyLogo";

import NotFound from "./pages/common/NotFound";
import { AuthContext } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import HomePage from "./pages/common/HomePage";
import UpdateProfilePicture from "./pages/user/UpdateProfilePicture";
import UpdateResume from "./pages/user/UpdateResume";

// Admin Components - NEW IMPORTS
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUserList from "./pages/admin/AdminUserList";
import AdminUserDetail from "./pages/admin/AdminUserDetail";
import AdminCompanyList from "./pages/admin/AdminCompanyList";
import AdminCompanyDetail from "./pages/admin/AdminCompanyDetail";

function App() {
  const { checkAuthStatus } = useContext(AuthContext);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user/register" element={<RegisterUser />} />
          <Route path="/user/verify/:token" element={<VerifyUser />} />
          <Route path="/company/register" element={<RegisterCompany />} />
          <Route path="/company/verify/:token" element={<VerifyCompany />} />
          <Route path="/user/verifyemail" element={<VerifyUserEmail />} />
          <Route path="/company/verifyemail" element={<VerifyCompanyEmail />} />
          <Route path="/jobs" element={<JobListing />} />
          <Route path="/jobs/:jobId" element={<JobDetails />} />
          <Route path="/search" element={<JobListing />} />

          {/* User Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
            <Route path="/user/profile" element={<UserProfile />} />
            <Route
              path="/user/profile/edit"
              element={<UpdateUserProfileInfo />}
            />
            <Route
              path="/user/profile/update-picture"
              element={<UpdateProfilePicture />}
            />
            <Route
              path="/user/profile/update-resume"
              element={<UpdateResume />}
            />
            <Route
              path="/user/profile/update-skills"
              element={<UpdateUserSkills />}
            />
            <Route
              path="/user/profile/change-password"
              element={<UpdateUserPassword />}
            />
            <Route
              path="/user/profile/change-email"
              element={<UpdateUserEmail />}
            />
            <Route path="/user/applied-jobs" element={<AppliedJobs />} />
            <Route path="/user/bookmarked-jobs" element={<BookmarkedJobs />} />
            <Route
              path="/user/profile/notifications"
              element={<NotificationsPage />}
            />
          </Route>

          {/* Company Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["company"]} />}>
            <Route path="/company/profile" element={<CompanyProfile />} />
            <Route
              path="/company/profile/edit"
              element={<UpdateCompanyProfileInfo />}
            />
            <Route
              path="/company/profile/update-logo"
              element={<UpdateCompanyLogo />}
            />
            <Route
              path="/company/profile/change-password"
              element={<UpdateCompanyPassword />}
            />
            <Route
              path="/company/profile/change-email"
              element={<UpdateCompanyEmail />}
            />
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
            <Route path="/company/jobs" element={<CompanyJobPostings />} />
            <Route path="/company/jobs/create" element={<CreateJobPosting />} />
            <Route
              path="/company/jobs/:jobId/applications"
              element={<JobApplications />}
            />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              {/* AdminLayout wraps all admin pages */}
              <Route index element={<AdminDashboard />} />{" "}
              {/* Default admin route */}
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<AdminUserList />} />
              <Route path="users/:userID" element={<AdminUserDetail />} />
              <Route path="companies" element={<AdminCompanyList />} />
              <Route
                path="companies/:companyID"
                element={<AdminCompanyDetail />}
              />
            </Route>
          </Route>

          {/* Fallback for unknown routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
