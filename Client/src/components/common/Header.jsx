import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faUser,
  faBuilding,
  faBriefcase,
  faBookmark,
  faClipboardList,
  faHome,
  faChartBar,
  faBars,
  faTimes,
  faBell,
  faTachometerAlt,
  faUsersCog,
  faBuildingFlag,
} from "@fortawesome/free-solid-svg-icons";

function Header() {
  const { user, company, admin, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    let result;
    if (user) {
      result = await logout("user");
    } else if (company) {
      result = await logout("company");
    } else if (admin) {
      result = await logout("admin");
    } else {
      // No active session, so do nothing.
      return;
    }

    if (result.success) {
      navigate("/login");
    }
    // No error message will be shown on failure.
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const userMenuItems = [
    { to: "/jobs", icon: faBriefcase, label: "All Jobs" },
    { to: "/user/applied-jobs", icon: faClipboardList, label: "Applied Jobs" },
    { to: "/user/bookmarked-jobs", icon: faBookmark, label: "Bookmarks" },
    {
      to: "/user/profile/notifications",
      icon: faBell,
      label: "Notifications",
      badge: user?.unReadNotificationCount,
    },
    { to: "/user/profile", icon: faUser, label: "My Profile" },
  ];

  const companyMenuItems = [
    { to: "/company/dashboard", icon: faChartBar, label: "Dashboard" },
    { to: "/company/jobs", icon: faBriefcase, label: "My Postings" },
    { to: "/company/profile", icon: faBuilding, label: "Company Profile" },
  ];

  const adminMenuItems = [
    { to: "/admin/dashboard", icon: faTachometerAlt, label: "Dashboard" },
    { to: "/admin/users", icon: faUsersCog, label: "Manage Users" },
    { to: "/admin/companies", icon: faBuildingFlag, label: "Manage Companies" },
  ];

  const renderMenuLinks = (items, onClickHandler) =>
    items.map((item) => (
      <Link
        key={item.to}
        to={item.to}
        className="hover:text-blue-200 transition-colors flex items-center relative"
        onClick={onClickHandler}
      >
        <FontAwesomeIcon icon={item.icon} className="mr-1" /> {item.label}
        {item.badge > 0 && (
          <span className="ml-1 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full absolute -top-2 -right-3">
            {item.badge}
          </span>
        )}
      </Link>
    ));

  const renderMobileLinks = (items) =>
    items.map((item) => (
      <Link
        key={item.to}
        to={item.to}
        className="block w-full text-center py-3 px-4 hover:bg-blue-700 rounded-md text-lg font-medium transition-colors duration-200 relative"
        onClick={toggleMobileMenu}
      >
        <FontAwesomeIcon icon={item.icon} className="mr-3" /> {item.label}
        {item.badge > 0 && (
          <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full absolute top-1/2 -translate-y-1/2 right-4">
            {item.badge}
          </span>
        )}
      </Link>
    ));

  return (
    <header className="bg-blue-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          to={admin ? "/admin/dashboard" : "/"}
          className="text-2xl font-bold"
        >
          CareerNest
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {!admin && (
            <Link
              to="/"
              className="hover:text-blue-200 transition-colors flex items-center"
            >
              <FontAwesomeIcon icon={faHome} className="mr-1" /> Home
            </Link>
          )}
          {!loading && user && renderMenuLinks(userMenuItems)}
          {!loading && company && renderMenuLinks(companyMenuItems)}
          {!loading && admin && renderMenuLinks(adminMenuItems)}
          {!loading && (user || company || admin) && (
            <button
              onClick={handleLogout}
              className="hover:text-blue-200 transition-colors flex items-center"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" /> Logout
            </button>
          )}
          {!loading && !user && !company && !admin && (
            <Link
              to="/login"
              className="hover:text-blue-200 transition-colors px-4 py-2 border border-white rounded-md"
            >
              Login
            </Link>
          )}
        </nav>

        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-200"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <FontAwesomeIcon
              icon={isMobileMenuOpen ? faTimes : faBars}
              size="lg"
            />
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        } md:hidden`}
        onClick={toggleMobileMenu}
      ></div>

      <nav
        id="mobile-menu"
        className={`fixed top-0 right-0 w-64 h-full bg-blue-800 z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden`}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={toggleMobileMenu}
            className="text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-200"
            aria-label="Close menu"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>
        <div className="flex flex-col items-center space-y-4 px-4 pb-4">
          {!admin && (
            <Link
              to="/"
              className="block w-full text-center py-3 px-4 hover:bg-blue-700 rounded-md text-lg font-medium transition-colors duration-200"
              onClick={toggleMobileMenu}
            >
              <FontAwesomeIcon icon={faHome} className="mr-3" /> Home
            </Link>
          )}
          {!loading && user && renderMobileLinks(userMenuItems)}
          {!loading && company && renderMobileLinks(companyMenuItems)}
          {!loading && admin && renderMobileLinks(adminMenuItems)}
          {!loading && (user || company || admin) && (
            <button
              onClick={() => {
                handleLogout();
                toggleMobileMenu();
              }}
              className="block w-full text-center py-3 px-4 hover:bg-blue-700 rounded-md text-lg font-medium transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" /> Logout
            </button>
          )}
          {!loading && !user && !company && !admin && (
            <Link
              to="/login"
              className="block w-full text-center py-3 px-4 hover:bg-blue-700 rounded-md border border-white text-lg font-medium transition-colors duration-200"
              onClick={toggleMobileMenu}
            >
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
