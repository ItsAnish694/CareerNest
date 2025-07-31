import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-toastify"; // Ensure toast is imported

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // Default role
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext); // Only need login function from AuthContext
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(role, email, password); // Pass email (or username for admin) and password
    setLoading(false);

    if (result.success) {
      toast.success(result.message); // Show success toast
      if (role === "user") {
        navigate("/jobs");
      } else if (role === "company") {
        // Assuming result.entity is available and contains isVerified
        navigate(
          result.entity?.isVerified === "verified" // Use optional chaining and lowercase "verified"
            ? "/company/dashboard"
            : "/company/profile"
        );
      } else if (role === "admin") {
        // Admin login provides a redirLink from the backend
        navigate(result.redirLink || "/admin/dashboard"); // Navigate to admin dashboard or default
      }
    } else {
      // Error message is already handled by the AuthContext's login function,
      // which uses axios interceptors for toast.error.
      // So, no need to set local errorMessage state here directly.
      // If you want a specific toast here, you could use:
      // toast.error(result.message || "Login failed. Please try again.");
    }
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
            <option value="admin">Admin</option> {/* Added Admin option */}
          </select>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {role === "admin" ? "Username" : "Email"} {/* Dynamic label */}
          </label>
          <input
            type={role === "admin" ? "text" : "email"}
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

        {/* Removed local errorMessage state and display, relying on toast */}

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
      {/* Removed the hardcoded email address */}
    </div>
  );
}

export default Login;
