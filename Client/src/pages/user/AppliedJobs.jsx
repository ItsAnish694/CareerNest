import { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";
import JobCard from "../../components/jobs/JobCard";
import Pagination from "../../components/common/Pagination";
import { AuthContext } from "../../contexts/AuthContext";
import Modal from "../../components/common/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function AppliedJobs() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobToDelete, setJobToDelete] = useState(null);

  const limit = 9;

  useEffect(() => {
    if (!authLoading && user) {
      fetchAppliedJobs();
    }
  }, [currentPage, user, authLoading]);

  const fetchAppliedJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/user/applications?limit=${limit}&page=${currentPage}`
      );
      setAppliedJobs(response.data.Success ? response.data.data : []);
    } catch {
      setAppliedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!jobToDelete) return;
    setLoading(true);
    try {
      await api.delete(`/user/applications/${jobToDelete}`);
      setAppliedJobs((prev) => prev.filter((job) => job._id !== jobToDelete));
      setJobToDelete(null);
      fetchAppliedJobs();
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <LoadingSpinner />;
  if (!user)
    return <NoDataMessage message="Please log in to view your applied jobs." />;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8">
        My Applied Jobs
      </h1>
      {loading ? (
        <LoadingSpinner />
      ) : appliedJobs.length === 0 ? (
        <NoDataMessage message="You have not applied for any jobs yet." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {appliedJobs.map((job) => (
            <div
              key={job._id}
              className="relative bg-white rounded-xl border border-gray-100 shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <JobCard job={job} currentUser={user} />
              <div className="absolute top-4 left-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                    job.status === "Accepted"
                      ? "bg-green-100 text-green-800"
                      : job.status === "Rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {job.status}
                </span>
              </div>
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setJobToDelete(job._id)}
                  className="p-2 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition"
                  title="Withdraw Application"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && appliedJobs.length > 0 && (
        <div className="mt-10">
          <Pagination
            currentPage={currentPage}
            totalItems={user?.applicationCount || 0}
            itemsPerPage={limit}
            onPageChange={setCurrentPage}
          />
        </div>
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
