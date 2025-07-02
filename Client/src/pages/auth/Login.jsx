import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(""); // clear any previous error

    const result = await login(role, email, password);
    setLoading(false);

    if (result.success) {
      if (role === "user") navigate("/jobs");
      else if (role === "company") {
        navigate(
          result.entity.isVerified === "Verified"
            ? "/company/dashboard"
            : "/company/profile"
        );
      }
    } else {
      setErrorMessage(result.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md my-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
        Login to CareerNest
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <label className="block text-sm font-medium text-gray-700">
          Login As
          <select
            className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
          >
            <option value="user">Job Seeker</option>
            <option value="company">Company</option>
          </select>
        </label>

        <label className="block text-sm font-medium text-gray-700">
          Email
          <input
            type="email"
            className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </label>

        <label className="block text-sm font-medium text-gray-700">
          Password
          <input
            type="password"
            className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </label>

        {errorMessage && (
          <div className="text-red-600 text-sm font-medium">{errorMessage}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors"
        >
          {loading ? <LoadingSpinner variant="inline" /> : "Login"}
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
