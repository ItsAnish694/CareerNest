import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";

function UserProfile() {
  const { user, loading, checkAuthStatus } = useContext(AuthContext);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      // AuthContext's checkAuthStatus already fetches user profile on load/login
      // We just need to wait for it to complete.
      if (!loading) {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, [loading]);

  if (profileLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <NoDataMessage message="User profile not found. Please log in." />;
  }

  return (
    <div className="max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl md:shadow-2xl my-6 sm:my-8 md:my-10 border border-gray-100">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-6 sm:mb-8 pb-4 border-b-2 border-blue-200">
        My Profile
      </h2>

      {!user.isVerified && (
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 sm:p-4 mb-6 rounded-md"
          role="alert"
        >
          <p className="font-bold text-base sm:text-lg">
            Account Not Fully Verified!
          </p>
          <p className="text-sm sm:text-base">
            Please check your email and complete the verification process to
            unlock all features.
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
        <div className="flex-shrink-0 text-center">
          <img
            src={user.profilePicture}
            alt="Profile"
            className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-blue-300 shadow-lg transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://res.cloudinary.com/dcsgpah7o/raw/upload/v1750015844/yhfkchms5dvz9we2nvga.png"; // Placeholder image
            }}
          />
          <div className="mt-4">
            <Link
              to="/user/profile/update-picture"
              className="text-blue-600 hover:underline text-sm sm:text-base font-medium"
            >
              Change Profile Picture
            </Link>
          </div>
        </div>

        <div className="flex-grow space-y-4 sm:space-y-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-600">Full Name:</p>
              <p className="text-gray-900 text-base sm:text-lg capitalize font-medium">
                {user.fullname}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Email:</p>
              <p className="text-gray-900 text-base sm:text-lg font-medium">
                {user.email}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">
                Phone Number:
              </p>
              <p className="text-gray-900 text-base sm:text-lg font-medium">
                {user.phoneNumber || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Experience:</p>
              <p className="text-gray-900 text-base sm:text-lg font-medium">
                {user.experiencedYears}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Location:</p>
              <p className="text-gray-900 text-base sm:text-lg capitalize font-medium">
                {user.area}, {user.city}, {user.district}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Resume:</p>
              {user.resumeLink ? (
                <a
                  href={user.resumeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-base sm:text-lg font-medium"
                >
                  View Resume
                </a>
              ) : (
                <span className="text-gray-500 text-base sm:text-lg">
                  Not provided
                </span>
              )}
              <div className="mt-1">
                <Link
                  to="/user/profile/update-resume"
                  className="text-blue-600 hover:underline text-sm sm:text-base font-medium"
                >
                  Update Resume
                </Link>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600">Bio:</p>
            <p className="text-gray-900 text-base sm:text-lg whitespace-pre-wrap font-medium">
              {user.bio || "No bio provided."}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600">Skills:</p>
            {user.skills && user.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {user.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-indigo-100 text-indigo-800 text-sm sm:text-base font-medium px-4 py-1.5 rounded-full capitalize shadow-sm hover:bg-indigo-200 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm sm:text-base">
                No skills added.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <p className="text-sm font-semibold text-gray-600">
                Applications:
              </p>
              <p className="text-gray-900 text-base sm:text-lg font-medium">
                {user.applicationCount}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600">Bookmarks:</p>
              <p className="text-gray-900 text-base sm:text-lg font-medium">
                {user.bookmarkCount}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-center md:justify-start gap-3 sm:gap-4 mt-6 sm:mt-8">
            <Link
              to="/user/profile/edit"
              className="w-full md:w-auto px-5 py-2.5 sm:px-6 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors text-center"
            >
              Edit Profile Info
            </Link>
            <Link
              to="/user/profile/update-skills"
              className="w-full md:w-auto px-5 py-2.5 sm:px-6 sm:py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-200 transition-colors text-center"
            >
              Manage Skills
            </Link>
            <Link
              to="/user/profile/change-password"
              className="w-full md:w-auto px-5 py-2.5 sm:px-6 sm:py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-200 transition-colors text-center"
            >
              Change Password
            </Link>
            <Link
              to="/user/profile/change-email"
              className="w-full md:w-auto px-5 py-2.5 sm:px-6 sm:py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-200 transition-colors text-center"
            >
              Change Email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
