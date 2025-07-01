import React, { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";
import Pagination from "../../components/common/Pagination";
import { AuthContext } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import Modal from "../../components/common/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUsers, faEye } from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";

function CompanyJobPostings() {
  const { company, loading: authLoading } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [jobToDelete, setJobToDelete] = useState(null); // State to hold job ID for deletion confirmation

  const limit = 10; // Number of jobs per page

  useEffect(() => {
    if (!authLoading && company && company.isVerified === "Verified") {
      fetchCompanyJobs();
    } else if (!authLoading && company && company.isVerified !== "Verified") {
      setLoading(false); // Stop loading if not verified
      setJobs([]);
    }
  }, [currentPage, company, authLoading]);

  const fetchCompanyJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/company/jobs?limit=${limit}&page=${currentPage}`
      );
      if (response.data.Success) {
        setJobs(response.data.data);
      } else {
        setJobs([]);
      }
    } catch (error) {
      setJobs([]);
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const confirmDeleteJob = (jobId) => {
    setJobToDelete(jobId);
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    setLoading(true);
    try {
      await api.delete(`/company/jobs/${jobToDelete}`);
      // toast.success is handled by interceptor
      setJobToDelete(null); // Close modal
      fetchCompanyJobs(); // Re-fetch jobs after deletion
    } catch (error) {
      // toast.error is handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!company) {
    return (
      <NoDataMessage message="Please log in as a company to view your job postings." />
    );
  }

  if (company.isVerified !== "Verified") {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md my-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Access Denied</h2>
        <p className="text-lg text-red-600 mb-4">
          Your company account is not yet verified.
        </p>
        <p className="text-gray-700 mb-6">
          Please complete the verification process via your profile page.
        </p>
        <Link
          to="/company/profile"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors"
        >
          Go to Company Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">My Job Postings</h1>
        <Link
          to="/company/jobs/create"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors"
        >
          Post New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <NoDataMessage message="You haven't posted any jobs yet. Start by posting your first job!" />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 uppercase text-xs font-medium text-gray-500 tracking-wider text-left">
                  Job Title
                </th>
                <th className="px-6 py-3 bg-gray-50 uppercase text-xs font-medium text-gray-500 tracking-wider text-left">
                  Job Type
                </th>
                <th className="px-6 py-3 bg-gray-50 uppercase text-xs font-medium text-gray-500 tracking-wider text-left">
                  Experience Level
                </th>
                <th className="px-6 py-3 bg-gray-50 uppercase text-xs font-medium text-gray-500 tracking-wider text-left">
                  Salary
                </th>
                <th className="px-6 py-3 bg-gray-50 uppercase text-xs font-medium text-gray-500 tracking-wider text-left">
                  Vacancies
                </th>
                <th className="px-6 py-3 bg-gray-50 uppercase text-xs font-medium text-gray-500 tracking-wider text-left">
                  Applications
                </th>
                <th className="px-6 py-3 bg-gray-50 uppercase text-xs font-medium text-gray-500 tracking-wider text-left">
                  Deadline
                </th>
                <th className="px-6 py-3 bg-gray-50 uppercase text-xs font-medium text-gray-500 tracking-wider text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {jobs.map((job, index) => (
                <tr
                  key={job._id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize font-medium">
                    {job.jobTitle}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {job.jobType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {job.experienceLevel}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.salary}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.vacancies}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.applicationCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(job.applicationDeadline), "MMM dd,PPPP")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex gap-2">
                      <Link
                        to={`/company/jobs/${job._id}/applications`}
                        className="p-2 rounded-full text-white shadow-sm hover:opacity-80 transition-opacity bg-purple-500"
                        title="View Applications"
                      >
                        <FontAwesomeIcon icon={faUsers} />
                      </Link>
                      <button
                        onClick={() => confirmDeleteJob(job._id)}
                        className="p-2 rounded-full text-white shadow-sm hover:opacity-80 transition-opacity bg-red-500"
                        title="Delete Job"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                      {/* Optional: Link to view job details as a user might see it */}
                      <Link
                        to={`/jobs/${job._id}`}
                        className="p-2 rounded-full text-white shadow-sm hover:opacity-80 transition-opacity bg-gray-500 hover:bg-gray-600"
                        title="Preview Job"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && jobs.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={company?.totalJobPosting || 0}
          itemsPerPage={limit}
          onPageChange={handlePageChange}
        />
      )}

      <Modal
        isOpen={jobToDelete !== null}
        onClose={() => setJobToDelete(null)}
        title="Delete Job Posting"
        onConfirm={handleDeleteJob}
        confirmText="Yes, Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
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
