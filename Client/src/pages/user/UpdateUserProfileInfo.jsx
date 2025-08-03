import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-toastify";

const experiencedYearsOptions = [
  "No Experience",
  "1 year",
  "2 years",
  "3 years",
  "4 years",
  "5 years",
  "6 years",
  "7 years",
  "8 years",
  "9 years",
  "10 or more",
];

function UpdateUserProfileInfo() {
  const {
    user,
    loading: authLoading,
    checkAuthStatus,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const [fullname, setFullname] = useState("");
  const [experiencedYears, setExperiencedYears] = useState("No Experience");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      setFullname(user.fullname || "");
      setExperiencedYears(user.experiencedYears || "No Experience");
      setBio(user.bio || "");

      const userLocation = [user.area, user.city, user.district]
        .filter(Boolean)
        .join(", ");
      setLocation(userLocation);
    }
  }, [user, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const locationParts = location.split(",").map((part) => part.trim());
    const area = locationParts[0] || "";
    const city = locationParts[1] || "";
    const district = locationParts[2] || "";

    const updateData = {
      fullname,
      experiencedYears,
      bio,
      district,
      city,
      area,
    };

    try {
      const response = await api.patch("/user/profile", updateData);
      if (response.data.Success) {
        toast.success("Profile updated successfully!");
        await checkAuthStatus();
        navigate("/user/profile");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.Error?.Message ||
          "Failed to update profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <p className="text-center text-red-500">
        Please log in to update your profile.
      </p>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md my-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
        Update Profile Information
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="fullname"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Full Name
          </label>
          <input
            type="text"
            id="fullname"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="experiencedYears"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Years of Experience
          </label>
          <select
            id="experiencedYears"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none custom-select-arrow"
            value={experiencedYears}
            onChange={(e) => setExperiencedYears(e.target.value)}
            required
            disabled={loading}
          >
            {experiencedYearsOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="bio"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Bio
          </label>
          <textarea
            id="bio"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={loading}
            placeholder="Tell us about yourself..."
          ></textarea>
        </div>
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={loading}
            placeholder="Enter as: Area, City, District (e.g., Ramailo Chowk, Bharatpur, Chitwan)"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors w-full flex items-center justify-center"
          disabled={loading}
        >
          {loading ? <LoadingSpinner variant="inline" /> : "Update Profile"}
        </button>
      </form>
    </div>
  );
}

export default UpdateUserProfileInfo;
