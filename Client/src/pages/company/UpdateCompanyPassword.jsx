import React, { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-toastify";

function UpdateCompanyPassword() {
  const { loading: authLoading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.patch("/company/profile/password", {
        currentPassword,
        updatedPassword: newPassword,
        confirmPassword,
      });
      if (response.data.Success) {
        await logout("company");
        navigate("/login");
      }
    } catch {
      // Handled globally by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md my-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
        Change Company Password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {[
          {
            id: "currentPassword",
            label: "Current Password",
            value: currentPassword,
            onChange: setCurrentPassword,
          },
          {
            id: "newPassword",
            label: "New Password",
            value: newPassword,
            onChange: setNewPassword,
            helper:
              "Strong password: 8+ characters, including numbers, uppercase, lowercase.",
          },
          {
            id: "confirmPassword",
            label: "Confirm New Password",
            value: confirmPassword,
            onChange: setConfirmPassword,
          },
        ].map(({ id, label, value, onChange, helper }) => (
          <div key={id}>
            <label
              htmlFor={id}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {label}
            </label>
            <input
              type="password"
              id={id}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              required
              disabled={loading}
            />
            {helper && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {loading ? (
            <LoadingSpinner variant="inline" size={20} />
          ) : (
            "Change Password"
          )}
        </button>
      </form>
    </div>
  );
}

export default UpdateCompanyPassword;
