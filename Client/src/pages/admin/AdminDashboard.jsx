import React, { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";
import { AuthContext } from "../../contexts/AuthContext";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// Colors for the Pie Chart.
const PIE_CHART_COLORS = ["#8884d8", "#ffc658", "#82ca9d"];

// Main component for the Admin Dashboard.
function AdminDashboard() {
  const { admin, loading: authLoading } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data when the component mounts or auth state changes.
  useEffect(() => {
    if (!authLoading) {
      if (admin?.role === "admin") {
        fetchDashboardData();
      } else {
        setDashboardData(null);
        setLoading(false);
      }
    }
  }, [authLoading, admin]);

  // Asynchronously fetches all the dashboard data from the backend API.
  async function fetchDashboardData() {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/dashboard");
      setDashboardData(data.Success ? data.data : null);
    } catch {
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }

  // Display a loading spinner while fetching data or authenticating.
  if (authLoading || loading) return <LoadingSpinner />;

  // Display access denied message if the user is not an admin.
  if (!admin || admin.role !== "admin") {
    return (
      <NoDataMessage message="Access Denied: You must be logged in as an administrator to view this page." />
    );
  }

  // Display a message if no dashboard data is available.
  if (!dashboardData) {
    return <NoDataMessage message="No dashboard data available." />;
  }

  // An array of stats to be rendered as cards on the dashboard.
  // This now includes the new monthly user and company stats.
  const stats = [
    { label: "Total Users", value: dashboardData.totalUsers, color: "blue" },
    {
      label: "Total Companies",
      value: dashboardData.totalCompanies,
      color: "green",
    },
    {
      label: "Verified Companies",
      value: dashboardData.verifiedCompanies,
      color: "purple",
    },
    {
      label: "Pending Companies",
      value: dashboardData.pendingCompanies,
      color: "yellow",
    },
    {
      label: "Total Job Postings",
      value: dashboardData.totalJobPostings,
      color: "red",
    },
    {
      label: "Total Applications",
      value: dashboardData.totalApplications,
      color: "indigo",
    },
    // New stats from the updated backend controller
    {
      label: "New Users This Month",
      value: dashboardData.newUserThisMonth,
      color: "teal",
    },
    {
      label: "New Companies This Month",
      value: dashboardData.newCompanyThisMonth,
      color: "orange",
    },
    {
      label: "New Jobs This Month",
      value: dashboardData.jobsThisMonth,
      color: "pink",
    },
    {
      label: "New Applications This Month",
      value: dashboardData.applicationsThisMonth,
      color: "cyan",
    },
  ];

  // Data for the monthly activity bar chart.
  // Updated to include new users and new companies this month.
  const monthlyData = [
    {
      name: "This Month",
      "New Jobs": dashboardData.jobsThisMonth,
      "New Applications": dashboardData.applicationsThisMonth,
      "New Users": dashboardData.newUserThisMonth,
      "New Companies": dashboardData.newCompanyThisMonth,
    },
  ];

  // Calculate the number of unverified/rejected companies.
  const otherCompanies =
    dashboardData.totalCompanies -
    dashboardData.verifiedCompanies -
    dashboardData.pendingCompanies;

  // Data for the company verification status pie chart.
  const companyStatusData = [
    { name: "Verified", value: dashboardData.verifiedCompanies },
    { name: "Pending", value: dashboardData.pendingCompanies },
  ];

  if (otherCompanies > 0) {
    companyStatusData.push({
      name: "Other (Unverified/Rejected)",
      value: otherCompanies,
    });
  }

  // Check if there is any monthly activity to display in the chart.
  const hasMonthlyActivity =
    dashboardData.jobsThisMonth > 0 ||
    dashboardData.applicationsThisMonth > 0 ||
    dashboardData.newUserThisMonth > 0 ||
    dashboardData.newCompanyThisMonth > 0;

  return (
    <div className="max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-6xl xl:max-w-7xl mx-auto bg-white p-4 sm:p-6 rounded-xl shadow-lg my-6 sm:my-10 border border-gray-100">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 mb-6 sm:mb-8 pb-3 border-b-2 border-blue-200">
        Admin Dashboard
      </h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
        {stats.map(({ label, value, color }) => (
          <div
            key={label}
            className={`bg-${color}-50 p-4 sm:p-5 rounded-lg shadow text-center border border-${color}-100`}
          >
            <h3
              className={`text-base sm:text-lg font-semibold text-${color}-800`}
            >
              {label}
            </h3>
            <p
              className={`text-2xl sm:text-3xl font-bold text-${color}-600 mt-1 sm:mt-2`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
        {/* Monthly Activity Bar Chart */}
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center border-b-2 pb-2 sm:pb-3 border-blue-200">
            Monthly Activity
          </h3>

          {hasMonthlyActivity ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="New Jobs" fill="#3b82f6" /> {/* Blue */}
                <Bar dataKey="New Applications" fill="#22c55e" /> {/* Green */}
                <Bar dataKey="New Users" fill="#f97316" /> {/* Orange */}
                <Bar dataKey="New Companies" fill="#14b8a6" /> {/* Teal */}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage message="No job, application, user, or company activity this month." />
          )}
        </section>

        {/* Company Verification Status Pie Chart */}
        <section className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-100">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center border-b-2 pb-2 sm:pb-3 border-blue-200">
            Company Verification Status
          </h3>

          {companyStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={companyStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {companyStatusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage message="No company data to display in the chart." />
          )}
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
