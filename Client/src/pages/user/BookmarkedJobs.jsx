import { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";
import JobCard from "../../components/jobs/JobCard";
import Pagination from "../../components/common/Pagination";
import { AuthContext } from "../../contexts/AuthContext";
import Modal from "../../components/common/Modal"; // Assuming you have a Modal component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark } from "@fortawesome/free-solid-svg-icons";

function BookmarkedJobs() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [bookmarkedJobs, setBookmarkedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobToRemove, setJobToRemove] = useState(null); // State to hold job ID for removal confirmation

  const limit = 10; // Number of jobs per page

  useEffect(() => {
    if (!authLoading && user) {
      fetchBookmarkedJobs();
    }
  }, [currentPage, user, authLoading]); // Re-fetch when page or user changes

  const fetchBookmarkedJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/user/bookmarks?limit=${limit}&page=${currentPage}`
      );
      if (response.data.Success) {
        setBookmarkedJobs(response.data.data);
      } else {
        setBookmarkedJobs([]);
      }
    } catch (error) {
      setBookmarkedJobs([]);
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const confirmRemoveBookmark = (jobId) => {
    setJobToRemove(jobId);
  };

  const handleRemoveBookmark = async () => {
    if (!jobToRemove) return;
    setLoading(true);
    try {
      await api.delete(`/user/bookmarks/${jobToRemove}`);
      // toast.success is handled by interceptor
      setBookmarkedJobs(
        bookmarkedJobs.filter((job) => job._id !== jobToRemove)
      ); // Optimistic UI update
      setJobToRemove(null); // Close modal
      fetchBookmarkedJobs(); // Re-fetch to ensure consistency and update counts
    } catch (error) {
      // toast.error is handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <NoDataMessage message="Please log in to view your bookmarked jobs." />
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
        My Bookmarked Jobs
      </h1>

      {loading ? (
        <LoadingSpinner />
      ) : bookmarkedJobs.length === 0 ? (
        <NoDataMessage message="You have not bookmarked any jobs yet." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarkedJobs.map((job) => (
            <div key={job._id} className="relative">
              <JobCard job={job} currentUser={user} />
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => confirmRemoveBookmark(job._id)}
                  className="p-2 rounded-full text-white shadow-sm hover:opacity-80 transition-opacity bg-yellow-500 hover:bg-yellow-600"
                  title="Remove Bookmark"
                >
                  <FontAwesomeIcon icon={faBookmark} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && bookmarkedJobs.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={user?.bookmarkCount || 0}
          itemsPerPage={limit}
          onPageChange={handlePageChange}
        />
      )}

      <Modal
        isOpen={jobToRemove !== null}
        onClose={() => setJobToRemove(null)}
        title="Remove Bookmark"
        onConfirm={handleRemoveBookmark}
        confirmText="Yes, Remove"
        confirmButtonClass="bg-yellow-600 hover:bg-yellow-700"
      >
        <p>Are you sure you want to remove this job from your bookmarks?</p>
      </Modal>
    </div>
  );
}

export default BookmarkedJobs;
