import React, { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-toastify";

function UpdateProfilePicture() {
  const {
    user,
    loading: authLoading,
    checkAuthStatus,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        toast.error("Only .jpeg, .jpg, and .png files are allowed.");
        setProfilePic(null);
        e.target.value = null; // Clear the input
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("File size must be less than 5MB.");
        setProfilePic(null);
        e.target.value = null; // Clear the input
        return;
      }
      setProfilePic(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!profilePic) {
      toast.error("Please select a new profile picture.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", profilePic);

    try {
      const response = await api.patch("/user/profile/profilePic", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
        Please log in to update your profile picture.
      </p>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md my-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
        Update Profile Picture
      </h2>
      <div className="flex justify-center mb-6">
        <img
          src={
            profilePic ? URL.createObjectURL(profilePic) : user.profilePicture
          }
          alt="Current Profile"
          className="w-40 h-40 rounded-full object-cover border-4 border-blue-200 shadow-md"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://res.cloudinary.com/dcsgpah7o/raw/upload/v1750015844/yhfkchms5dvz9we2nvga.png";
          }}
        />
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="profilePic"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Choose New Profile Picture (JPG, PNG - Max 5MB)
          </label>
          <input
            type="file"
            id="profilePic"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors w-full flex items-center justify-center"
          disabled={loading || !profilePic}
        >
          {loading ? <LoadingSpinner variant="inline" /> : "Update Picture"}
        </button>
      </form>
    </div>
  );
}

export default UpdateProfilePicture;
