import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // 'user' or 'company'
  const [loading, setLoading] = useState(false);
  const { login, user, company } = useContext(AuthContext); // Also get user/company from context for observation

  const navigate = useNavigate();

  // This useEffect will react to changes in the global AuthContext state
  // and can be used to trigger navigation if the user/company state becomes populated.
  useEffect(() => {
    console.log(
      "Login Component: AuthContext user/company changed. User:",
      user,
      "Company:",
      company
    );
    if (!loading && (user || company)) {
      // Only navigate if not loading and a user/company is present
      if (user) {
        console.log("Login Component: Navigating user to /jobs");
        navigate("/jobs");
      } else if (company) {
        if (company.isVerified === "Verified") {
          console.log(
            "Login Component: Navigating verified company to /company/dashboard"
          );
          navigate("/company/dashboard");
        } else {
          console.log(
            "Login Component: Navigating unverified company to /company/profile"
          );
          navigate("/company/profile");
        }
      }
    }
  }, [user, company, loading, navigate]); // Depend on user, company, loading, and navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(
      "Login Component: Login button clicked. Setting loading to true."
    );
    setLoading(true);

    const result = await login(role, email, password);
    setLoading(false); // Ensures loading state is reset regardless of success or failure
    console.log("Login Component: Login function returned:", result);

    toast.success(result.message);
    // toast.error is already handled by the axios interceptor in api.js
    console.log("Login Component: Login failed. Error handled by interceptor.");
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md my-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
        Login to CareerNest
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Login As
          </label>
          <select
            id="role"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none custom-select-arrow"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="user">Job Seeker</option>
            <option value="company">Company</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors w-full flex items-center justify-center"
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : "Login"}
        </button>
      </form>
      <p className="mt-6 text-center text-gray-600">
        Don't have an account?{" "}
        <Link to="/user/register" className="text-blue-600 hover:underline">
          Register as Job Seeker
        </Link>{" "}
        or{" "}
        <Link to="/company/register" className="text-blue-600 hover:underline">
          Register as Company
        </Link>
      </p>
    </div>
  );
}

export default Login;
