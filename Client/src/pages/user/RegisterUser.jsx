import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function RegisterUser() {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        toast.error(
          "Only .jpeg, .jpg, and .png files are allowed for profile picture."
        );
        setProfilePic(null);
        e.target.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("File size must be less than 5MB.");
        setProfilePic(null);
        e.target.value = null;
        return;
      }
      setProfilePic(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("fullname", fullname);
    formData.append("email", email);
    formData.append("password", password);
    if (profilePic) {
      formData.append("profilePic", profilePic);
    }

    try {
      const response = await api.post("/user/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.Success) {
        navigate("/login"); // Redirect to login page to allow verification process
      }
    } catch (error) {
      // toast.error is handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md my-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
        Register as Job Seeker
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
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="profilePic"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Profile Picture (Optional)
          </label>
          <input
            type="file"
            id="profilePic"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            accept="image/*"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors w-full flex items-center justify-center"
          disabled={loading}
        >
          {loading ? <LoadingSpinner variant="inline" /> : "Register"}
        </button>
      </form>
      <p className="mt-6 text-center text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}

export default RegisterUser;
