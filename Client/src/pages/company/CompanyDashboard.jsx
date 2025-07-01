import React, { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";
import { AuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

function CompanyDashboard() {
  const { company, loading: authLoading } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && company) {
      if (company.isVerified !== "Verified") {
        setDashboardData({
          totalJobPosting: 0,
          totalApplications: 0,
          totalAcceptedApplications: 0,
          totalRejectedApplications: 0,
          totalPendingApplications: 0,
          message:
            "Company is not yet verified. Dashboard data will be available after verification.",
        });
        setLoading(false);
        return;
      }
      fetchDashboardData();
    }
  }, [authLoading, company]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get("/company/dashboard");
      if (response.data.Success) {
        setDashboardData(response.data.data);
      } else {
        setDashboardData(null);
      }
    } catch (error) {
      setDashboardData(null);
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!company) {
    return (
      <NoDataMessage message="Please log in as a company to view the dashboard." />
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md my-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
        Company Dashboard
      </h2>

      {company.isVerified !== "Verified" && (
        <div
          className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded"
          role="alert"
        >
          <p className="font-bold">Account Not Verified!</p>
          <p>
            {dashboardData?.message ||
              "Your company needs to be verified to access full dashboard features and post jobs."}
          </p>
          <Link
            to="/company/profile"
            className="text-blue-600 hover:underline text-sm mt-2 block"
          >
            Go to Profile to check verification status
          </Link>
        </div>
      )}

      {company.isVerified === "Verified" && dashboardData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold text-blue-800">
              Total Job Postings
            </h3>
            <p className="text-4xl font-bold text-blue-600 mt-2">
              {dashboardData.totalJobPosting}
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold text-green-800">
              Total Applications
            </h3>
            <p className="text-4xl font-bold text-green-600 mt-2">
              {dashboardData.totalApplications}
            </p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold text-purple-800">
              Accepted Applications
            </h3>
            <p className="text-4xl font-bold text-purple-600 mt-2">
              {dashboardData.totalAcceptedApplications}
            </p>
          </div>
          <div className="bg-red-50 p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold text-red-800">
              Rejected Applications
            </h3>
            <p className="text-4xl font-bold text-red-600 mt-2">
              {dashboardData.totalRejectedApplications}
            </p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold text-yellow-800">
              Pending Applications
            </h3>
            <p className="text-4xl font-bold text-yellow-600 mt-2">
              {dashboardData.totalPendingApplications}
            </p>
          </div>
        </div>
      ) : (
        company.isVerified === "Verified" && (
          <NoDataMessage message="No dashboard data available." />
        )
      )}
    </div>
  );
}

export default CompanyDashboard;
