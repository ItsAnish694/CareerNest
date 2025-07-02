import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function HomePage() {
  const { user, company, loading } = useContext(AuthContext);

  return (
    <div className="max-w-full mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 md:py-24 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl shadow-2xl relative">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4 leading-tight">
        Welcome to CareerNest!
      </h1>
      <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-4xl mx-auto opacity-95">
        Your ultimate platform to find your dream job or the perfect candidate.
      </p>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          {/* Assuming LoadingSpinner uses only Tailwind or is a simple SVG/HTML */}
          <LoadingSpinner />
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
          {!user && !company && (
            <>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3 bg-white text-blue-700 font-bold rounded-full shadow-xl hover:bg-gray-100 hover:shadow-2xl transition-all duration-300 text-center text-lg"
              >
                Login
              </Link>
              <Link
                to="/user/register"
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold rounded-full shadow-xl hover:from-green-500 hover:to-blue-600 hover:shadow-2xl transition-all duration-300 text-center text-lg"
              >
                Register as Job Seeker
              </Link>
              <Link
                to="/company/register"
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-xl hover:from-purple-600 hover:to-pink-600 hover:shadow-2xl transition-all duration-300 text-center text-lg"
              >
                Register as Company
              </Link>
            </>
          )}

          {user && (
            <Link
              to="/jobs"
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold rounded-full shadow-xl hover:from-green-500 hover:to-blue-600 hover:shadow-2xl transition-all duration-300 text-center text-lg"
            >
              Browse Jobs
            </Link>
          )}

          {company && (
            <Link
              to="/company/dashboard"
              className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-xl hover:from-purple-600 hover:to-pink-600 hover:shadow-2xl transition-all duration-300 text-center text-lg"
            >
              Company Dashboard
            </Link>
          )}
        </div>
      )}
      <p className="mt-12 sm:mt-16 text-lg sm:text-xl opacity-90 max-w-4xl mx-auto">
        Ready to take the next step in your career or find top talent? Join us
        today!
      </p>
    </div>
  );
}

export default HomePage;
