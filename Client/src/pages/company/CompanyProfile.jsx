import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";

function CompanyProfile() {
  const { company, loading: authLoading } = useContext(AuthContext);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) setProfileLoading(false);
  }, [authLoading]);

  if (profileLoading) {
    return <LoadingSpinner />;
  }

  if (!company) {
    return (
      <NoDataMessage message="Company profile not found. Please log in." />
    );
  }

  const statusClasses = {
    unverified: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
    verified: "bg-green-100 text-green-700",
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow my-10">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Company Profile
      </h2>

      <div
        className={`p-3 rounded mb-6 text-center font-medium ${
          statusClasses[company.isVerified]
        }`}
      >
        Verification Status: {company.isVerified}
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="flex-shrink-0 text-center">
          <img
            src={company.companyLogo}
            alt="Company Logo"
            className="w-28 h-28 rounded-full object-cover border-2 border-blue-200 shadow"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://res.cloudinary.com/dcsgpah7o/image/upload/v1749728727/y2vmdzxonqvfcxobngfc.png";
            }}
          />
          <Link
            to="/company/profile/update-logo"
            className="block mt-2 text-blue-600 hover:underline text-sm"
          >
            Change Logo
          </Link>
        </div>

        <div className="flex-grow space-y-4 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Info label="Company Name" value={company.companyName} />
            <Info label="Email" value={company.companyEmail} />
            <Info label="Phone" value={company.companyPhoneNumber || "N/A"} />
            <Info
              label="Location"
              value={`${company.companyArea}, ${company.companyCity}, ${company.companyDistrict}`}
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600">Bio:</p>
            <p className="text-gray-800 whitespace-pre-wrap">
              {company.companyBio || "No bio provided."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center sm:justify-start gap-3 pt-4">
            <ProfileButton to="/company/profile/edit" label="Edit Info" />
            <ProfileButton
              to="/company/profile/change-password"
              label="Change Password"
            />
            <ProfileButton
              to="/company/profile/change-email"
              label="Change Email"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-600">{label}:</p>
      <p className="text-gray-900 capitalize">{value}</p>
    </div>
  );
}

function ProfileButton({ to, label }) {
  return (
    <Link
      to={to}
      className="px-5 py-2 bg-gray-200 text-gray-800 font-medium rounded shadow hover:bg-gray-300 transition"
    >
      {label}
    </Link>
  );
}

export default CompanyProfile;
