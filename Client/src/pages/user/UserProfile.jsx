import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";

function UserProfile() {
  const { user, loading } = useContext(AuthContext);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      setProfileLoading(false);
    }
  }, [loading]);

  if (profileLoading) return <LoadingSpinner />;
  if (!user)
    return <NoDataMessage message="User profile not found. Please log in." />;

  const defaultProfilePicture =
    "https://res.cloudinary.com/dcsgpah7o/raw/upload/v1750015844/yhfkchms5dvz9we2nvga.png";

  return (
    <div className="max-w-6xl mx-auto bg-white p-5 sm:p-8 md:p-10 rounded-xl shadow-2xl my-8 border border-gray-100 transition-all">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-8 border-b-2 pb-3 border-blue-200">
        My Profile
      </h2>

      {!user.isVerified && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded-md mb-6">
          <p className="font-bold">Account Not Fully Verified!</p>
          <p>
            Please check your email and complete the verification process to
            unlock all features.
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
        <div className="flex-shrink-0 text-center">
          <img
            src={user.profilePicture || defaultProfilePicture}
            alt="Profile"
            onError={(e) => {
              e.target.src = defaultProfilePicture;
            }}
            className="w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-blue-300 shadow-lg hover:scale-105 transition-transform duration-300"
          />
          <div className="mt-3">
            <Link
              to="/user/profile/update-picture"
              className="text-blue-600 hover:underline text-sm font-medium"
            >
              Change Profile Picture
            </Link>
          </div>
        </div>

        <div className="flex-grow w-full space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ProfileField label="Full Name" value={user.fullname} capitalize />
            <ProfileField label="Email" value={user.email} />
            <ProfileField
              label="Phone Number"
              value={user.phoneNumber || "N/A"}
            />
            <ProfileField label="Experience" value={user.experiencedYears} />
            <ProfileField
              label="Location"
              value={`${user.area}, ${user.city}, ${user.district}`}
              capitalize
            />
            <div>
              <p className="text-sm font-semibold text-gray-600">Resume:</p>
              {user.resumeLink ? (
                <a
                  href={user.resumeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  View Resume
                </a>
              ) : (
                <p className="text-gray-500">Not provided</p>
              )}
              <div className="mt-1">
                <Link
                  to="/user/profile/update-resume"
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  Update Resume
                </Link>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600">Bio:</p>
            <p className="text-gray-900 whitespace-pre-wrap font-medium">
              {user.bio || "No bio provided."}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-600">Skills:</p>
            {user.skills && user.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {user.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full capitalize shadow-sm hover:bg-indigo-200 transition"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No skills added.</p>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-5">
            <ProfileField label="Applications" value={user.applicationCount} />
            <ProfileField label="Bookmarks" value={user.bookmarkCount} />
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mt-6">
            <ProfileActionLink
              to="/user/profile/edit"
              label="Edit Profile Info"
              primary
            />
            <ProfileActionLink
              to="/user/profile/update-skills"
              label="Manage Skills"
            />
            <ProfileActionLink
              to="/user/profile/change-password"
              label="Change Password"
            />
            <ProfileActionLink
              to="/user/profile/change-email"
              label="Change Email"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value, capitalize }) {
  return (
    <div>
      <p className="text-sm font-semibold text-gray-600">{label}:</p>
      <p
        className={`text-gray-900 font-medium ${
          capitalize ? "capitalize" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ProfileActionLink({ to, label, primary }) {
  return (
    <Link
      to={to}
      className={`w-full sm:w-auto px-5 py-2.5 text-center rounded-lg font-semibold transition-colors shadow-md ${
        primary
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
    </Link>
  );
}

export default UserProfile;
