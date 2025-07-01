import React, { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";
import JobCard from "../../components/jobs/JobCard";
import Pagination from "../../components/common/Pagination";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import Modal from "../../components/common/Modal"; // Assuming you have a Modal component
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";

function AppliedJobs() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobToDelete, setJobToDelete] = useState(null); // State to hold job ID for deletion confirmation

  const limit = 10; // Number of jobs per page

  useEffect(() => {
    if (!authLoading && user) {
      fetchAppliedJobs();
    }
  }, [currentPage, user, authLoading]); // Re-fetch when page or user changes

  const fetchAppliedJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/user/applications?limit=${limit}&page=${currentPage}`
      );
      if (response.data.Success) {
        setAppliedJobs(response.data.data);
      } else {
        setAppliedJobs([]);
      }
    } catch (error) {
      setAppliedJobs([]);
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const confirmDeleteApplication = (jobId) => {
    setJobToDelete(jobId);
  };

  const handleDeleteApplication = async () => {
    if (!jobToDelete) return; // Should not happen if modal is triggered correctly
    setLoading(true);
    try {
      await api.delete(`/user/applications/${jobToDelete}`);
      // toast.success is handled by interceptor
      setAppliedJobs(appliedJobs.filter((job) => job._id !== jobToDelete)); // Optimistic UI update
      setJobToDelete(null); // Close modal
      fetchAppliedJobs(); // Re-fetch to ensure data consistency and update counts
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
    return <NoDataMessage message="Please log in to view your applied jobs." />;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
        My Applied Jobs
      </h1>

      {loading ? (
        <LoadingSpinner />
      ) : appliedJobs.length === 0 ? (
        <NoDataMessage message="You have not applied for any jobs yet." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appliedJobs.map((job) => (
            <div key={job._id} className="relative">
              <JobCard job={job} currentUser={user} />
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => confirmDeleteApplication(job._id)}
                  className="p-2 rounded-full text-white shadow-sm hover:opacity-80 transition-opacity bg-red-500"
                  title="Withdraw Application"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
              <div className="absolute top-4 left-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    job.status === "Accepted"
                      ? "bg-green-100 text-green-800"
                      : job.status === "Rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  Status: {job.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && appliedJobs.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={user?.applicationCount || 0}
          itemsPerPage={limit}
          onPageChange={handlePageChange}
        />
      )}

      <Modal
        isOpen={jobToDelete !== null}
        onClose={() => setJobToDelete(null)}
        title="Withdraw Application"
        onConfirm={handleDeleteApplication}
        confirmText="Yes, Withdraw"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      >
        <p>Are you sure you want to withdraw your application for this job?</p>
      </Modal>
    </div>
  );
}

export default AppliedJobs;
