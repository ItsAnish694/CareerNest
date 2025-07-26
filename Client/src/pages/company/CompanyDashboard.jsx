import React, { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";
import { AuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts"; // Import Recharts components

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

  // Prepare data for the pie chart
  const pieChartData = [
    { name: "Accepted", value: dashboardData.totalAcceptedApplications },
    { name: "Rejected", value: dashboardData.totalRejectedApplications },
    { name: "Pending", value: dashboardData.totalPendingApplications },
  ];

  // Define colors for the pie chart slices
  const COLORS = ["#8884d8", "#ff4d4f", "#ffc658"]; // Purple, Red, Yellow (matching tailwind colors roughly)

  return (
    <div className="max-w-full sm:max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-lg my-10 border border-gray-100">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8 border-b-2 pb-3 border-blue-200">
        Company Dashboard
      </h2>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {stats.map((item) => (
          <div
            key={item.label}
            className={`bg-${item.color}-50 p-5 rounded-lg shadow text-center border border-${item.color}-100`}
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

      {/* Pie Chart for Application Statuses */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center border-b-2 pb-3 border-blue-200">
          Application Status Distribution
        </h3>
        {/* Check if there's data to display in the pie chart */}
        {dashboardData.totalApplications > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <NoDataMessage message="No application data to display in the chart." />
        )}
      </div>
    </div>
  );
}

export default CompanyDashboard;
