import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";
import Pagination from "../../components/common/Pagination";
import Modal from "../../components/common/Modal";
import ButtonLoadingSpinner from "../../components/common/LoadingSpinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUsers, faPlus } from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import { toast } from "react-toastify";

function CompanyJobPostings() {
  const { company, loading: authLoading } = useContext(AuthContext);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const limit = 9;
  useEffect(() => {
    if (!authLoading && company?.isVerified === "Verified") {
      fetchJobs();
    } else if (!authLoading) {
      setLoading(false);
      setJobs([]);
    }
  }, [authLoading, company, currentPage]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/company/jobs?limit=${limit}&page=${currentPage}`
      );
      setJobs(res.data.Success ? res.data.data : []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/company/jobs/${jobToDelete}`);
      toast.success("Job posting deleted successfully!");
      setJobToDelete(null);
      fetchJobs();
    } catch (error) {
      // Error handled by your API interceptor
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || loading) return <LoadingSpinner />;

  if (!company)
    return (
      <NoDataMessage message="Please log in as a company to view your job postings." />
    );

  if (company.isVerified !== "Verified")
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md my-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-lg text-red-600 mb-4">
          Your company account is not verified.
        </p>
        <Link
          to="/company/profile"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
        >
          Go to Company Profile
        </Link>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-lg my-8 border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
          My Job Postings
        </h1>
        <Link
          to="/company/jobs/create"
          className="flex items-center px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" /> Post New Job
        </Link>
      </div>

      {/* Job List */}
      {jobs.length === 0 ? (
        <NoDataMessage message="You haven't posted any jobs yet. Start by posting your first job!" />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          {/* Table Header (visible on md+) */}
          <div className="hidden md:grid md:grid-cols-[1.5fr_1fr_1fr_1fr_0.5fr_0.7fr_1.2fr_1fr] bg-blue-600 text-white font-semibold">
            <div className="px-4 py-2">Job Title</div>
            <div className="px-4 py-2">Job Type</div>
            <div className="px-4 py-2">Experience</div>
            <div className="px-4 py-2">Salary</div>
            <div className="px-4 py-2">Vacancies</div>
            <div className="px-4 py-2">Applications</div>
            <div className="px-4 py-2">Deadline</div>
            <div className="px-4 py-2">Actions</div>
          </div>

          <div className="divide-y">
            {jobs.map((job, index) => (
              <div
                key={job._id}
                className={`grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr_0.5fr_0.7fr_1.2fr_1fr] gap-4 md:gap-0 p-4 ${
                  index % 2 === 0
                    ? "bg-white"
                    : "bg-gray-50 hover:bg-gray-100 transition"
                }`}
              >
                <div className="text-sm text-gray-900 capitalize font-medium md:px-4 md:py-2">
                  <span className="md:hidden font-semibold text-gray-500">
                    Job Title:{" "}
                  </span>
                  {job.jobTitle}
                </div>
                <div className="text-sm text-gray-700 capitalize md:px-4 md:py-2">
                  <span className="md:hidden font-semibold text-gray-500">
                    Job Type:{" "}
                  </span>
                  {job.jobType}
                </div>
                <div className="text-sm text-gray-700 capitalize md:px-4 md:py-2">
                  <span className="md:hidden font-semibold text-gray-500">
                    Experience:{" "}
                  </span>
                  {job.experienceLevel}
                </div>
                <div className="text-sm text-gray-700 md:px-4 md:py-2">
                  <span className="md:hidden font-semibold text-gray-500">
                    Salary:{" "}
                  </span>
                  {job.salary}
                </div>
                <div className="text-sm text-gray-700 md:px-4 md:py-2 text-left md:text-center">
                  <span className="md:hidden font-semibold text-gray-500">
                    Vacancies:{" "}
                  </span>
                  {job.vacancies}
                </div>
                <div className="text-sm text-gray-700 md:px-4 md:py-2 text-left md:text-center">
                  <span className="md:hidden font-semibold text-gray-500">
                    Applications:{" "}
                  </span>
                  {job.applicationCount}
                </div>
                <div className="text-sm text-gray-700 md:px-4 md:py-2">
                  <span className="md:hidden font-semibold text-gray-500">
                    Deadline:{" "}
                  </span>
                  {job.applicationDeadline
                    ? format(
                        new Date(job.applicationDeadline),
                        "MMMM d, yyyy (EEEE)"
                      )
                    : "N/A"}
                </div>
                <div className="flex gap-2 md:px-4 md:py-2">
                  <Link
                    to={`/company/jobs/${job._id}/applications`}
                    className="p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600"
                    title="View Applications"
                  >
                    <FontAwesomeIcon icon={faUsers} />
                  </Link>
                  <button
                    onClick={() => setJobToDelete(job._id)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    title="Delete"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {jobs.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalItems={company.totalJobPosting || 0}
            itemsPerPage={limit}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={jobToDelete !== null}
        onClose={() => setJobToDelete(null)}
        title="Delete Job Posting"
        onConfirm={deleteJob}
        confirmText={
          isDeleting ? (
            <ButtonLoadingSpinner
              text="Deleting..."
              spinnerColor="text-white"
              textColor="text-white"
            />
          ) : (
            "Yes, Delete"
          )
        }
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isConfirmDisabled={isDeleting}
      >
        <p>Are you sure you want to delete this job posting?</p>
        <p className="text-sm text-red-500 mt-2">
          This action cannot be undone and will also delete all associated
          applications.
        </p>
      </Modal>
    </div>
  );
}

export default CompanyJobPostings;
