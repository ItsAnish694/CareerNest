import { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-toastify";

function UpdateCompanyLogo() {
  const {
    company,
    loading: authLoading,
    checkAuthStatus,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const [companyLogo, setCompanyLogo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        toast.error("Only .jpeg, .jpg, and .png files are allowed.");
        setCompanyLogo(null);
        e.target.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB.");
        setCompanyLogo(null);
        e.target.value = null;
        return;
      }
      setCompanyLogo(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyLogo) {
      toast.error("Please select a new company logo.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("companyLogo", companyLogo);

    try {
      const response = await api.patch(
        "/company/profile/companyLogo",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.data.Success) {
        await checkAuthStatus();
        navigate("/company/profile");
      }
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (authLoading)
    return <LoadingSpinner message="Loading your company info..." />;

  if (!company)
    return (
      <p className="text-center text-red-500 mt-10">
        Please log in to update your company logo.
      </p>
    );

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md my-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
        Update Company Logo
      </h2>
      <div className="flex justify-center mb-6">
        <img
          src={
            companyLogo ? URL.createObjectURL(companyLogo) : company.companyLogo
          }
          alt="Current Company Logo"
          className="w-40 h-40 rounded-full object-cover border-4 border-blue-200 shadow-md"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://res.cloudinary.com/dcsgpah7o/image/upload/v1749728727/y2vmdzxonqvfcxobngfc.png";
          }}
        />
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <label
          htmlFor="companyLogo"
          className="block text-sm font-medium text-gray-700"
        >
          Choose New Company Logo (JPG, PNG - Max 5MB)
          <input
            type="file"
            id="companyLogo"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            disabled={loading}
            className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <button
          type="submit"
          disabled={loading || !companyLogo}
          className="w-full flex justify-center items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {loading ? (
            <LoadingSpinner variant="inline" size={20} />
          ) : (
            "Update Logo"
          )}
        </button>
      </form>
    </div>
  );
}

export default UpdateCompanyLogo;
