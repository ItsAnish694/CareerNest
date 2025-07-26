import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-toastify"; // Import toast

function UpdateCompanyProfileInfo() {
  const {
    company,
    loading: authLoading,
    checkAuthStatus,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: "",
    companyBio: "",
    companyLocation: "", // Single string for location
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && company) {
      // Combine existing location fields into a single string for the form
      const location = [
        company.companyArea,
        company.companyCity,
        company.companyDistrict,
      ]
        .filter(Boolean) // Remove null/undefined/empty strings
        .join(", ");

      setForm({
        companyName: company.companyName || "",
        companyBio: company.companyBio || "",
        companyLocation: location, // Set the combined location
      });
    }
  }, [company, authLoading]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Parse the single companyLocation string into area, city, and district
    const locationParts = form.companyLocation
      .split(",")
      .map((part) => part.trim());
    const companyArea = locationParts[0] || "";
    const companyCity = locationParts[1] || "";
    const companyDistrict = locationParts[2] || "";

    const updatePayload = {
      companyName: form.companyName,
      companyBio: form.companyBio,
      companyArea: companyArea,
      companyCity: companyCity,
      companyDistrict: companyDistrict,
    };

    try {
      const response = await api.patch("/company/profile", updatePayload);
      if (response.data.Success) {
        toast.success("Company profile updated successfully!"); // Success toast
        await checkAuthStatus(); // Re-fetch auth status to update context with new data
        navigate("/company/profile"); // Navigate back to profile page
      }
    } catch (error) {
      // Error handled globally by interceptor, but a specific toast for this might be useful
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

  if (!company) {
    return (
      <p className="text-center text-red-500">
        Please log in to update your company profile.
      </p>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md my-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
        Update Company Profile
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          id="companyName"
          label="Company Name"
          value={form.companyName}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <TextAreaField
          id="companyBio"
          label="Company Bio"
          value={form.companyBio}
          onChange={handleChange}
          disabled={loading}
          placeholder="Tell us about your company..."
        />
        <InputField
          id="companyLocation" // Single location input field
          label="Company Location"
          value={form.companyLocation}
          onChange={handleChange}
          disabled={loading}
          helperText="Enter as: Area, City, District (e.g., Ramailo Chowk, Bharatpur, Chitwan)"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors"
        >
          {loading ? (
            <LoadingSpinner variant="inline" size={20} />
          ) : (
            "Update Profile"
          )}
        </button>
      </form>
    </div>
  );
}

function InputField({
  id,
  label,
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
        type="text"
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

export default UpdateCompanyProfileInfo;
