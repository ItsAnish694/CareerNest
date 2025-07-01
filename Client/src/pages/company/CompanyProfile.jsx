import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";

function CompanyProfile() {
  const {
    company,
    loading: authLoading,
    checkAuthStatus,
  } = useContext(AuthContext);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    // AuthContext's checkAuthStatus already fetches company profile on load/login
    // We just need to wait for it to complete.
    if (!authLoading) {
      setProfileLoading(false);
    }
  }, [authLoading]);

  if (profileLoading) {
    return <LoadingSpinner />;
  }

  if (!company) {
    return (
      <NoDataMessage message="Company profile not found. Please log in." />
    );
  }

  const verificationStatusColors = {
    "Not Verified": "bg-red-100 text-red-800",
    Pending: "bg-yellow-100 text-yellow-800",
    Verified: "bg-green-100 text-green-800",
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md my-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
        My Company Profile
      </h2>

      <div
        className={`p-4 mb-6 rounded ${
          verificationStatusColors[company.isVerified]
        }`}
        role="alert"
      >
        <p className="font-bold">Verification Status: {company.isVerified}</p>
        {company.isVerified === "Not Verified" && (
          <p>
            Please complete your company verification to post jobs and manage
            applications.
          </p>
        )}
        {company.isVerified === "Pending" && (
          <p>
            Your verification request is pending review. You will be notified
            once it's approved.
          </p>
        )}
        {company.isVerified === "Verified" && (
          <p>
            Your company is verified! You can now post jobs and manage
            applications.
          </p>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="flex-shrink-0">
          <img
            src={company.companyLogo}
            alt="Company Logo"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://res.cloudinary.com/dcsgpah7o/image/upload/v1749728727/y2vmdzxonqvfcxobngfc.png";
            }}
          />
          <div className="mt-4 text-center">
            <Link
              to="/company/profile/update-logo"
              className="text-blue-600 hover:underline text-sm"
            >
              Change Company Logo
            </Link>
          </div>
        </div>

        <div className="flex-grow space-y-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600">
                Company Name:
              </p>
              <p className="text-gray-900 text-lg capitalize">
                {company.companyName}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">
                Company Email:
              </p>
              <p className="text-gray-900 text-lg">{company.companyEmail}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">
                Phone Number:
              </p>
              <p className="text-gray-900 text-lg">
                {company.companyPhoneNumber || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Location:</p>
              <p className="text-gray-900 text-lg capitalize">
                {company.companyArea}, {company.companyCity},{" "}
                {company.companyDistrict}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600">Company Bio:</p>
            <p className="text-gray-900 text-lg whitespace-pre-wrap">
              {company.companyBio || "No company bio provided."}
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-center md:justify-start gap-4 mt-8">
            <Link
              to="/company/profile/edit"
              className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-md shadow-md hover:bg-gray-300 transition-colors"
            >
              Edit Company Info
            </Link>
            <Link
              to="/company/profile/change-password"
              className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-md shadow-md hover:bg-gray-300 transition-colors"
            >
              Change Password
            </Link>
            <Link
              to="/company/profile/change-email"
              className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-md shadow-md hover:bg-gray-300 transition-colors"
            >
              Change Email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfile;
