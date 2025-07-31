import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function RegisterCompany() {
  const [form, setForm] = useState({
    companyName: "",
    companyEmail: "",
    companyPassword: "",
    companyLogo: null,
    // companyLocation: "", // Removed: Single string for user input
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value, files } = e.target;

    if (id === "companyLogo") {
      const file = files[0];
      if (file) {
        if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
          toast.error("Only .jpeg, .jpg, and .png files are allowed.");
          e.target.value = null;
          setForm((prev) => ({ ...prev, companyLogo: null }));
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error("File size must be less than 5MB.");
          e.target.value = null;
          setForm((prev) => ({ ...prev, companyLogo: null }));
          return;
        }
        setForm((prev) => ({ ...prev, companyLogo: file }));
      }
    } else {
      setForm((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("companyName", form.companyName);
    formData.append("companyEmail", form.companyEmail);
    formData.append("companyPassword", form.companyPassword);

    // Removed: Parse the single companyLocation string into area, city, and district
    // const locationParts = form.companyLocation.split(',').map(part => part.trim());
    // const companyArea = locationParts[0] || '';
    // const companyCity = locationParts[1] || '';
    // const companyDistrict = locationParts[2] || '';

    // Removed: Appending location parts to formData
    // formData.append("companyArea", companyArea);
    // formData.append("companyCity", companyCity);
    // formData.append("companyDistrict", companyDistrict);

    if (form.companyLogo) {
      formData.append("companyLogo", form.companyLogo);
    }

    try {
      const response = await api.post("/company/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.Success) {
        toast.success(
          "Company registered successfully! Please check your email for verification."
        );
        navigate("/login");
      }
    } catch (error) {
      // Error handled globally by interceptor, but a specific toast for registration might be useful
      toast.error(
        error.response?.data?.Error?.Message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md my-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
        Register Your Company
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          id="companyName"
          label="Company Name"
          type="text"
          value={form.companyName}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <InputField
          id="companyEmail"
          label="Company Email"
          type="email"
          value={form.companyEmail}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <InputField
          id="companyPassword"
          label="Password"
          type="password"
          value={form.companyPassword}
          onChange={handleChange}
          required
          disabled={loading}
          helperText="Strong password: 8 characters, numbers, uppercase, lowercase."
        />
        {/* Removed: companyLocation InputField */}
        {/*
        <InputField
          id="companyLocation"
          label="Company Location"
          type="text"
          value={form.companyLocation}
          onChange={handleChange}
          required
          disabled={loading}
          helperText="Enter as: Area, City, District (e.g., Ramailo Chowk, Bharatpur, Chitwan)"
        />
        */}
        <div>
          <label
            htmlFor="companyLogo"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Company Logo (Optional, JPG, PNG - Max 5MB)
          </label>
          <input
            type="file"
            id="companyLogo"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleChange}
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center w-full h-full">
              <svg
                className="animate-spin h-4 w-4 text-white mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-white text-sm font-medium">Loading...</span>
            </span>
          ) : (
            "Register Company"
          )}
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

function InputField({
  id,
  label,
  type,
  value,
  onChange,
  required,
  disabled,
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

export default RegisterCompany;
