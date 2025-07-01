import React, { useContext, useState } from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function Header() {
  const { user, company, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    let result;
    if (user) {
      result = await logout("user");
    } else if (company) {
      result = await logout("company");
    }
    if (result.success) {
      toast.success(result.message);
      navigate("/login");
    } else {
      toast.error(result.message);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-blue-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          CareerNest
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            to="/"
            className="hover:text-blue-200 transition-colors flex items-center"
          >
            <FontAwesomeIcon icon={faHome} className="mr-1" /> Home
          </Link>

          {/* All Jobs link - now only visible for logged-in 'user' role */}
          {!loading && user && (
            <Link
              to="/jobs"
              className="hover:text-blue-200 transition-colors flex items-center"
            >
              <FontAwesomeIcon icon={faBriefcase} className="mr-1" /> All Jobs
            </Link>
          )}

          {!loading && user && (
            <>
              <Link
                to="/user/applied-jobs"
                className="hover:text-blue-200 transition-colors flex items-center"
              >
                <FontAwesomeIcon icon={faClipboardList} className="mr-1" />{" "}
                Applied Jobs
              </Link>
              <Link
                to="/user/bookmarked-jobs"
                className="hover:text-blue-200 transition-colors flex items-center"
              >
                <FontAwesomeIcon icon={faBookmark} className="mr-1" /> Bookmarks
              </Link>
              <Link
                to="/user/profile"
                className="hover:text-blue-200 transition-colors flex items-center"
              >
                <FontAwesomeIcon icon={faUser} className="mr-1" /> My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="hover:text-blue-200 transition-colors flex items-center"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" /> Logout
              </button>
            </>
          )}

          {!loading && company && (
            <>
              <Link
                to="/company/dashboard"
                className="hover:text-blue-200 transition-colors flex items-center"
              >
                <FontAwesomeIcon icon={faChartBar} className="mr-1" /> Dashboard
              </Link>
              <Link
                to="/company/jobs"
                className="hover:text-blue-200 transition-colors flex items-center"
              >
                <FontAwesomeIcon icon={faBriefcase} className="mr-1" /> My
                Postings
              </Link>
              <Link
                to="/company/profile"
                className="hover:text-blue-200 transition-colors flex items-center"
              >
                <FontAwesomeIcon icon={faBuilding} className="mr-1" /> Company
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="hover:text-blue-200 transition-colors flex items-center"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" /> Logout
              </button>
            </>
          )}

          {!loading && !user && !company && (
            <Link
              to="/login"
              className="hover:text-blue-200 transition-colors px-4 py-2 border border-white rounded-md"
            >
              Login
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-white transition-colors duration-200"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <FontAwesomeIcon
              icon={isMobileMenuOpen ? faTimes : faBars}
              size="lg"
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay with Blur */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        } md:hidden`}
        onClick={toggleMobileMenu} // Close menu when clicking outside
      ></div>

      {/* Mobile Menu Content (slides in from right) */}
      <nav
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
          <Link
            to="/"
            className="block w-full text-center py-3 px-4 hover:bg-blue-700 rounded-md text-lg font-medium transition-colors duration-200"
            onClick={toggleMobileMenu}
          >
            <FontAwesomeIcon icon={faHome} className="mr-3" /> Home
          </Link>

          {/* All Jobs link in mobile menu - now only visible for logged-in 'user' role */}
          {!loading && user && (
            <Link
              to="/jobs"
              className="block w-full text-center py-3 px-4 hover:bg-blue-700 rounded-md text-lg font-medium transition-colors duration-200"
              onClick={toggleMobileMenu}
            >
              <FontAwesomeIcon icon={faBriefcase} className="mr-3" /> All Jobs
            </Link>
          )}

          {!loading && user && (
            <>
              <Link
                to="/user/applied-jobs"
                className="block w-full text-center py-3 px-4 hover:bg-blue-700 rounded-md text-lg font-medium transition-colors duration-200"
                onClick={toggleMobileMenu}
              >
                <FontAwesomeIcon icon={faClipboardList} className="mr-3" />{" "}
                Applied Jobs
              </Link>
              <Link
                to="/user/bookmarked-jobs"
                className="block w-full text-center py-3 px-4 hover:bg-blue-700 rounded-md text-lg font-medium transition-colors duration-200"
                onClick={toggleMobileMenu}
              >
                <FontAwesomeIcon icon={faBookmark} className="mr-3" /> Bookmarks
              </Link>
              <Link
                to="/user/profile"
                className="block w-full text-center py-3 px-4 hover:bg-blue-700 rounded-md text-lg font-medium transition-colors duration-200"
                onClick={toggleMobileMenu}
              >
                <FontAwesomeIcon icon={faUser} className="mr-3" /> My Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  toggleMobileMenu();
                }}
                className="block w-full text-center py-3 px-4 hover:bg-blue-700 rounded-md text-lg font-medium transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" /> Logout
              </button>
            </>
          )}

          {!loading && company && (
            <>
              <Link
                to="/company/dashboard"
                className="block w-full text-center py-3 px-4 hover:bg-blue-700 rounded-md text-lg font-medium transition-colors duration-200"
                onClick={toggleMobileMenu}
              >
                <FontAwesomeIcon icon={faChartBar} className="mr-3" /> Dashboard
              </Link>
              <Link
                to="/company/jobs"
                className="block w-full text-center py-3 px-4 hover:bg-blue-700 rounded-md text-lg font-medium transition-colors duration-200"
                onClick={toggleMobileMenu}
              >
                <FontAwesomeIcon icon={faBriefcase} className="mr-3" /> My
                Postings
              </Link>
              <Link
                to="/company/profile"
                className="block w-full text-center py-3 px-4 hover:bg-blue-700 rounded-md text-lg font-medium transition-colors duration-200"
                onClick={toggleMobileMenu}
              >
                <FontAwesomeIcon icon={faBuilding} className="mr-3" /> Company
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  toggleMobileMenu();
                }}
                className="block w-full text-center py-3 px-4 hover:bg-blue-700 rounded-md text-lg font-medium transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-3" /> Logout
              </button>
            </>
          )}

          {!loading && !user && !company && (
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
