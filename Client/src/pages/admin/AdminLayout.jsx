import { useContext } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faUsers,
  faBuilding,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

function AdminLayout() {
  const { admin, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await logout("admin");
    if (result.success) {
      toast.success(result.message);
      navigate("/login");
    } else {
      toast.error(result.message || "Admin logout failed.");
    }
  };

  if (loading) return <LoadingSpinner />;

  if (!admin || admin.role !== "admin") {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-700">
            You do not have administrative access.
          </p>
          <Link
            to="/login"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <aside className="hidden md:flex flex-col w-64 bg-blue-800 text-white shadow-lg">
        <div className="p-6 text-3xl font-extrabold text-center border-b border-blue-700">
          Admin Panel
        </div>
        <nav className="flex-grow p-4 space-y-2">
          <NavLink
            to="/admin/dashboard"
            icon={faTachometerAlt}
            label="Dashboard"
          />
          <NavLink to="/admin/users" icon={faUsers} label="Manage Users" />
          <NavLink
            to="/admin/companies"
            icon={faBuilding}
            label="Manage Companies"
          />
        </nav>
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-left rounded-md hover:bg-blue-700 transition-colors"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-grow p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavLink({ to, icon, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-lg font-medium"
    >
      <FontAwesomeIcon icon={icon} className="mr-3" /> {label}
    </Link>
  );
}

export default AdminLayout;
