import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const experiencedYearsOptions = [
  "No Experience",
  "Less than 1 year",
  "1 year",
  "2 years",
  "3 years",
  "4 years",
  "5 years",
  "6 years",
  "7 years",
  "8 years",
  "9 years",
  "10+ years",
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
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      setFullname(user.fullname || "");
      setExperiencedYears(user.experiencedYears || "No Experience");
      setBio(user.bio || "");
      setDistrict(user.district || "");
      setCity(user.city || "");
      setArea(user.area || "");
    }
  }, [user, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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
        await checkAuthStatus(); // Update user info in context
        navigate("/user/profile");
      }
    } catch (error) {
      // Error handled by interceptor
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
            htmlFor="district"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            District
          </label>
          <input
            type="text"
            id="district"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            City
          </label>
          <input
            type="text"
            id="city"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="area"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Area
          </label>
          <input
            type="text"
            id="area"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            disabled={loading}
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
