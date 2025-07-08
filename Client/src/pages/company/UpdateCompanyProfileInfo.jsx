import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";

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
    companyDistrict: "",
    companyCity: "",
    companyArea: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && company) {
      setForm({
        companyName: company.companyName || "",
        companyBio: company.companyBio || "",
        companyDistrict: company.companyDistrict || "",
        companyCity: company.companyCity || "",
        companyArea: company.companyArea || "",
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

    try {
      const response = await api.patch("/company/profile", form);
      if (response.data.Success) {
        await checkAuthStatus();
        navigate("/company/profile");
      }
    } catch (error) {
      console.log(error.message);
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
          id="companyDistrict"
          label="Company District"
          value={form.companyDistrict}
          onChange={handleChange}
          disabled={loading}
        />
        <InputField
          id="companyCity"
          label="Company City"
          value={form.companyCity}
          onChange={handleChange}
          disabled={loading}
        />
        <InputField
          id="companyArea"
          label="Company Area"
          value={form.companyArea}
          onChange={handleChange}
          disabled={loading}
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

function InputField({ id, label, value, onChange, disabled, required }) {
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
