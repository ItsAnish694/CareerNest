import React, { useState, useEffect, useContext } from "react";
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
  const [companyName, setCompanyName] = useState("");
  const [companyBio, setCompanyBio] = useState("");
  const [companyDistrict, setCompanyDistrict] = useState("");
  const [companyCity, setCompanyCity] = useState("");
  const [companyArea, setCompanyArea] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && company) {
      setCompanyName(company.companyName || "");
      setCompanyBio(company.companyBio || "");
      setCompanyDistrict(company.companyDistrict || "");
      setCompanyCity(company.companyCity || "");
      setCompanyArea(company.companyArea || "");
    }
  }, [company, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updateData = {
      companyName,
      companyBio,
      companyDistrict,
      companyCity,
      companyArea,
    };

    try {
      const response = await api.patch("/company/profile", updateData);
      if (response.data.Success) {
        await checkAuthStatus(); // Update company info in context
        navigate("/company/profile");
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
        <div>
          <label
            htmlFor="companyName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Company Name
          </label>
          <input
            type="text"
            id="companyName"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="companyBio"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Company Bio
          </label>
          <textarea
            id="companyBio"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            value={companyBio}
            onChange={(e) => setCompanyBio(e.target.value)}
            disabled={loading}
            placeholder="Tell us about your company..."
          ></textarea>
        </div>
        <div>
          <label
            htmlFor="companyDistrict"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Company District
          </label>
          <input
            type="text"
            id="companyDistrict"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={companyDistrict}
            onChange={(e) => setCompanyDistrict(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="companyCity"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Company City
          </label>
          <input
            type="text"
            id="companyCity"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={companyCity}
            onChange={(e) => setCompanyCity(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="companyArea"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Company Area
          </label>
          <input
            type="text"
            id="companyArea"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={companyArea}
            onChange={(e) => setCompanyArea(e.target.value)}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors w-full flex items-center justify-center"
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : "Update Profile"}
        </button>
      </form>
    </div>
  );
}

export default UpdateCompanyProfileInfo;
