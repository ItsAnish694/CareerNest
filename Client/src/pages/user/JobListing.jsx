import { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";
import JobCard from "../../components/jobs/JobCard";
import Pagination from "../../components/common/Pagination";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

function JobListing() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobTypeFilter, setJobTypeFilter] = useState("recommended");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const [totalJobsCount, setTotalJobsCount] = useState(0);

  const limit = 9;

  useEffect(() => {
    const typeParam = searchParams.get("type") || "recommended";
    const pageParam = parseInt(searchParams.get("page")) || 1;
    const qParam = searchParams.get("q") || "";

    setJobTypeFilter(typeParam);
    setCurrentPage(pageParam);
    setSearchQuery(qParam);
    fetchJobs(typeParam, pageParam, qParam);
  }, [searchParams, user]);

  const fetchJobs = async (type, page, q) => {
    setLoading(true);
    try {
      let url = "";
      if (q) {
        url = `/user/search?q=${q}&limit=${limit}&page=${page}`;
      } else {
        url = `/user/jobs?type=${type}&limit=${limit}&page=${page}`;
      }
      const response = await api.get(url);
      const Success = response.data.Success;
      const data = response.data.data.slice(0, response.data.data.length - 1);
      const totalCount =
        response.data.data[response.data.data.length - 1].totalCount;

      if (Success) {
        setJobs(data);
        setTotalJobsCount(
          totalCount !== undefined ? totalCount : response.data.data.length
        );
      } else {
        setJobs([]);
        setTotalJobsCount(0);
      }
    } catch (error) {
      setJobs([]);
      setTotalJobsCount(0);
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateSearchParams(jobTypeFilter, page, searchQuery);
  };

  const handleTypeChange = (type) => {
    setJobTypeFilter(type);
    setCurrentPage(1);
    updateSearchParams(type, 1, searchQuery);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setJobTypeFilter("recommended");
    updateSearchParams("recommended", 1, searchQuery);
  };

  const updateSearchParams = (type, page, q) => {
    const newParams = new URLSearchParams();
    if (q) {
      newParams.set("q", q);
    }
    if (type && !q) {
      newParams.set("type", type);
    }
    newParams.set("page", page.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-6xl xl:max-w-7xl mx-auto bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl md:shadow-2xl my-6 sm:my-8 md:my-10 border border-gray-100">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-gray-900 mb-6 sm:mb-8 pb-4 border-b-2 border-blue-200">
        Discover Your Next Opportunity
      </h1>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8 sm:mb-10">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
          <input
            type="text"
            className="w-full p-3 sm:p-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition-all duration-200 flex-grow text-base sm:text-lg placeholder-gray-500"
            placeholder="Search by skill, type, level (e.g., React, Full Time, Entry Level)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 text-base sm:text-lg"
            disabled={loading}
          >
            Search
          </button>
        </form>
      </div>

      {/* Job Type Filters (only visible when not actively searching) */}
      {!searchQuery && (
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
          <button
            onClick={() => handleTypeChange("recommended")}
            className={`px-5 py-2.5 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 shadow-sm
                    ${
                      jobTypeFilter === "recommended"
                        ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
            disabled={loading}
          >
            Recommended
          </button>
          <button
            onClick={() => handleTypeChange("latest")}
            className={`px-5 py-2.5 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 shadow-sm
                    ${
                      jobTypeFilter === "latest"
                        ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
            disabled={loading}
          >
            Latest Jobs
          </button>
          <button
            onClick={() => handleTypeChange("top")}
            className={`px-5 py-2.5 rounded-full font-semibold text-sm sm:text-base transition-all duration-200 shadow-sm
                    ${
                      jobTypeFilter === "top"
                        ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
            disabled={loading}
          >
            Top Applications
          </button>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : jobs.length === 0 ? (
        <NoDataMessage message="No jobs found matching your criteria. Try a different search or filter!" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} currentUser={user} />
          ))}
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <div className="mt-8 sm:mt-10 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalItems={totalJobsCount}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

export default JobListing;
