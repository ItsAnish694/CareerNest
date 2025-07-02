import { useState, useEffect, useContext } from "react";
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
      if (company.isVerified === "Verified") {
        fetchDashboardData();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, company]);

  const fetchDashboardData = async () => {
    try {
      const res = await api.get("/company/dashboard");
      if (res.data.Success) {
        setDashboardData(res.data.data);
      } else {
        setDashboardData(null);
      }
    } catch {
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <LoadingSpinner />;

  if (!company) {
    return (
      <NoDataMessage message="Please log in as a company to view the dashboard." />
    );
  }

  if (company.isVerified !== "Verified") {
    return (
      <div className="max-w-xl mx-auto bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-6 rounded shadow my-10 text-center">
        <h2 className="text-xl font-bold mb-2">Account Not Verified</h2>
        <p>
          Your company needs to be verified to access the dashboard and post
          jobs.
        </p>
        <Link
          to="/company/profile"
          className="inline-block mt-4 text-blue-600 font-medium hover:underline"
        >
          Go to Profile
        </Link>
      </div>
    );
  }

  if (!dashboardData) {
    return <NoDataMessage message="No dashboard data available." />;
  }

  const stats = [
    {
      label: "Total Job Postings",
      value: dashboardData.totalJobPosting,
      color: "blue",
    },
    {
      label: "Total Applications",
      value: dashboardData.totalApplications,
      color: "green",
    },
    {
      label: "Accepted Applications",
      value: dashboardData.totalAcceptedApplications,
      color: "purple",
    },
    {
      label: "Rejected Applications",
      value: dashboardData.totalRejectedApplications,
      color: "red",
    },
    {
      label: "Pending Applications",
      value: dashboardData.totalPendingApplications,
      color: "yellow",
    },
  ];

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow my-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
        Company Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((item) => (
          <div
            key={item.label}
            className={`bg-${item.color}-50 p-5 rounded shadow text-center`}
          >
            <h3 className={`text-lg font-semibold text-${item.color}-800`}>
              {item.label}
            </h3>
            <p className={`text-3xl font-bold text-${item.color}-600 mt-2`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompanyDashboard;
