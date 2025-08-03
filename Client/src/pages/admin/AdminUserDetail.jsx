import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import Modal from "../../components/common/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

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

function AdminUserDetail() {
  const { userID } = useParams();
  const navigate = useNavigate();
  const { admin, loading: authLoading } = useContext(AuthContext);

  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    bio: "",
    location: "",
    experiencedYears: "No Experience",
  });

  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && admin?.role === "admin") {
      fetchUserDetail();
    } else if (!authLoading) {
      setLoading(false);
      setUser(null);
    }
  }, [authLoading, admin, userID]);

  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/users/${userID}`);
      if (data.Success && data.data) {
        const userData = data.data;
        setUser(userData);
        const userLocation = [userData.area, userData.city, userData.district]
          .filter(Boolean)
          .join(", ");
        setForm({
          fullname: userData.fullname || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
          bio: userData.bio || "",
          location: userLocation,
          experiencedYears: userData.experiencedYears || "No Experience",
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
      // Error handled globally by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const locationParts = form.location.split(",").map((part) => part.trim());
    const [area = "", city = "", district = ""] = locationParts;

    const updatePayload = {
      fullname: form.fullname,
      email: form.email,
      phoneNumber: form.phoneNumber,
      bio: form.bio,
      area,
      city,
      district,
      experiencedYears: form.experiencedYears,
    };

    try {
      const { data } = await api.put(`/admin/users/${userID}`, updatePayload);
      if (data.Success) {
        toast.success("User profile updated successfully!");
        setUser(data.data);
      }
    } catch {
      // Error handled globally by interceptor
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsConfirmingDelete(false);
    setIsDeleting(true);
    try {
      await api.delete(`/admin/users/${userID}`);
      toast.success("User account deleted successfully!");
      navigate("/admin/users");
    } catch {
      //lol
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || loading) return <LoadingSpinner />;

  if (!admin || admin.role !== "admin") {
    return (
      <NoDataMessage message="Access Denied: You must be logged in as an administrator to view this page." />
    );
  }

  if (!user) return <NoDataMessage message="User not found." />;

  return (
    <div className="max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto bg-white p-4 sm:p-6 rounded-xl shadow-lg my-6 sm:my-10 border border-gray-100">
      <button
        onClick={() => navigate("/admin/users")}
        className="mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors flex items-center font-semibold text-base shadow-sm"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back to Users
      </button>

      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-6 border-b-2 pb-3 border-blue-200">
        Edit User: {user.fullname}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          id="fullname"
          label="Full Name"
          value={form.fullname}
          onChange={handleChange}
          disabled={isUpdating}
          required
        />
        <InputField
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={handleChange}
          disabled={isUpdating}
          required
        />
        <InputField
          id="phoneNumber"
          label="Phone Number"
          type="text"
          value={form.phoneNumber}
          onChange={handleChange}
          disabled={isUpdating}
          required
        />
        <TextAreaField
          id="bio"
          label="Bio"
          value={form.bio}
          onChange={handleChange}
          disabled={isUpdating}
          placeholder="User's biography..."
        />
        <InputField
          id="location"
          label="Location (Area, City, District)"
          type="text"
          value={form.location}
          onChange={handleChange}
          disabled={isUpdating}
          required
          helperText="e.g., Ramailo Chowk, Bharatpur, Chitwan"
        />
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
            value={form.experiencedYears}
            onChange={handleChange}
            required
            disabled={isUpdating}
          >
            {experiencedYearsOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <button
            type="submit"
            disabled={isUpdating}
            className="flex-grow flex justify-center items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors"
          >
            {isUpdating ? (
              <LoadingSpinner variant="inline" />
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="mr-2" /> Update User
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            disabled={isUpdating}
            className="flex-grow flex justify-center items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-700 transition-colors"
          >
            <FontAwesomeIcon icon={faTrash} className="mr-2" /> Delete User
          </button>
        </div>
      </form>

      <Modal
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        title="Confirm User Deletion"
        onConfirm={handleDeleteUser}
        confirmText={
          isDeleting ? (
            <LoadingSpinner variant="inline" />
          ) : (
            "Yes, Delete Permanently"
          )
        }
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isConfirmDisabled={isDeleting}
      >
        <p>Are you sure you want to permanently delete this user account?</p>
        <p className="text-sm text-red-500 mt-2">
          This action cannot be undone and will remove all associated data,
          including applications and bookmarks.
        </p>
      </Modal>
    </div>
  );
}

function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  disabled,
  required,
  helperText,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
}

function TextAreaField({ id, label, value, onChange, disabled, placeholder }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
      />
    </div>
  );
}

export default AdminUserDetail;
