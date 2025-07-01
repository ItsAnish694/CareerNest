import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";
import Pagination from "../../components/common/Pagination";
import { AuthContext } from "../../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faFileAlt,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../components/common/Modal"; // Assuming you have a Modal component
import { toast } from "react-toastify";
import { format } from "date-fns";

function JobApplications() {
  const { jobId } = useParams();
  const { company, loading: authLoading } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState(""); // 'Accepted', 'Rejected', 'Pending'
  const [jobTitle, setJobTitle] = useState(""); // To display in header
  const [selectedApplicant, setSelectedApplicant] = useState(null); // For viewing applicant details in modal

  const limit = 10;

  useEffect(() => {
    if (!authLoading && company && company.isVerified === "Verified") {
      fetchJobApplications();
    } else if (!authLoading && company && company.isVerified !== "Verified") {
      setLoading(false);
      setApplications([]);
    }
  }, [jobId, currentPage, filterStatus, company, authLoading]);

  const fetchJobApplications = async () => {
    setLoading(true);
    try {
      // First, get the job title to display
      // Note: Backend doesn't have a direct /job/:id for company yet, so we fetch all company jobs and find
      const companyJobsRes = await api.get("/company/jobs");
      if (companyJobsRes.data.Success) {
        const currentJob = companyJobsRes.data.data.find(
          (j) => j._id === jobId
        );
        if (currentJob) {
          setJobTitle(currentJob.jobTitle);
        } else {
          setJobTitle("Job Not Found");
          toast.error("Job not found or does not belong to your company.");
          setLoading(false);
          return;
        }
      }

      let url = `/company/jobs/${jobId}/applications?limit=${limit}&page=${currentPage}`;
      if (filterStatus) {
        url += `&status=${filterStatus}`;
      }
      const response = await api.get(url);
      if (response.data.Success) {
        setApplications(response.data.data);
      } else {
        setApplications([]);
      }
    } catch (error) {
      setApplications([]);
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1); // Reset page on filter change
  };

  const updateApplicationStatus = async (applicationId, status) => {
    setLoading(true);
    try {
      await api.post(`/company/application/${applicationId}?status=${status}`);
      // toast.success is handled by interceptor
      fetchJobApplications(); // Re-fetch applications to update status
    } catch (error) {
      // toast.error is handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const viewApplicantDetails = (applicant) => {
    setSelectedApplicant(applicant);
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!company) {
    return (
      <NoDataMessage message="Please log in as a company to view job applications." />
    );
  }

  if (company.isVerified !== "Verified") {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md my-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Access Denied</h2>
        <p className="text-lg text-red-600 mb-4">
          Your company account must be verified to view job applications.
        </p>
        <p className="text-gray-700 mb-6">
          Please ensure your company profile verification is complete and
          approved.
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
      <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
        Applications for: <span className="capitalize">{jobTitle}</span>
      </h1>
      <p className="text-center text-gray-600 mb-8">
        Total Applications: {applications.length > 0 ? applications.length : 0}
      </p>

      {/* Filter Buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => handleFilterChange("")}
          className={`px-4 py-2 rounded-md font-semibold ${
            filterStatus === ""
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
          disabled={loading}
        >
          All ({company?.totalApplications})
        </button>
        <button
          onClick={() => handleFilterChange("Pending")}
          className={`px-4 py-2 rounded-md font-semibold ${
            filterStatus === "Pending"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
          disabled={loading}
        >
          Pending ({company?.totalPendingApplications})
        </button>
        <button
          onClick={() => handleFilterChange("Accepted")}
          className={`px-4 py-2 rounded-md font-semibold ${
            filterStatus === "Accepted"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
          disabled={loading}
        >
          Accepted ({company?.totalAcceptedApplications})
        </button>
        <button
          onClick={() => handleFilterChange("Rejected")}
          className={`px-4 py-2 rounded-md font-semibold ${
            filterStatus === "Rejected"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
          disabled={loading}
        >
          Rejected ({company?.totalRejectedApplications})
        </button>
      </div>

      {applications.length === 0 ? (
        <NoDataMessage message="No applications found for this job or with the selected status." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white p-6 rounded-lg shadow-md relative"
            >
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={app.profilePicture}
                  alt={app.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://res.cloudinary.com/dcsgpah7o/raw/upload/v1750015844/yhfkchms5dvz9we2nvga.png";
                  }}
                />
                <div>
                  <h3 className="text-xl font-semibold capitalize">
                    {app.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{app.email}</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-700">
                  <strong>Experience:</strong> {app.experiencedYears}
                </p>
                <p className="text-gray-700">
                  <strong>Applied On:</strong>{" "}
                  {format(new Date(app.appliedAt), "MMM dd,PPPP")}
                </p>
                <p className="text-gray-700">
                  <strong>Status:</strong>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                      app.status === "Accepted"
                        ? "bg-green-100 text-green-800"
                        : app.status === "Rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {app.status}
                  </span>
                </p>
                {app.bio && (
                  <p className="text-gray-700 mt-2 text-sm italic line-clamp-3">
                    "{app.bio}"
                  </p>
                )}
              </div>

              <div className="mb-4">
                <h4 className="text-md font-medium text-gray-700 mb-2">
                  Skills:
                </h4>
                {app.skills && app.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {app.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full capitalize"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No skills listed.</p>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4">
                {app.status === "Pending" && (
                  <>
                    <button
                      onClick={() =>
                        updateApplicationStatus(app._id, "Accepted")
                      }
                      className="p-2 rounded-full text-white shadow-sm hover:opacity-80 transition-opacity bg-green-600"
                      title="Accept Application"
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </button>
                    <button
                      onClick={() =>
                        updateApplicationStatus(app._id, "Rejected")
                      }
                      className="p-2 rounded-full text-white shadow-sm hover:opacity-80 transition-opacity bg-red-600"
                      title="Reject Application"
                    >
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                  </>
                )}
                <a
                  href={app.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full text-white shadow-sm hover:opacity-80 transition-opacity bg-blue-500 hover:bg-blue-600"
                  title="View Resume"
                >
                  <FontAwesomeIcon icon={faFileAlt} />
                </a>
                <button
                  onClick={() => viewApplicantDetails(app)}
                  className="p-2 rounded-full text-white shadow-sm hover:opacity-80 transition-opacity bg-gray-500 hover:bg-gray-600"
                  title="View Full Details"
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && applications.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={company?.totalApplications || 0}
          itemsPerPage={limit}
          onPageChange={handlePageChange}
        />
      )}

      {selectedApplicant && (
        <Modal
          isOpen={selectedApplicant !== null}
          onClose={() => setSelectedApplicant(null)}
          title={`Applicant Details: ${selectedApplicant.name}`}
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <img
                src={selectedApplicant.profilePicture}
                alt={selectedApplicant.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://res.cloudinary.com/dcsgpah7o/raw/upload/v1750015844/yhfkchms5dvz9we2nvga.png";
                }}
              />
              <div>
                <h3 className="text-2xl font-semibold capitalize">
                  {selectedApplicant.name}
                </h3>
                <p className="text-gray-600">{selectedApplicant.email}</p>
              </div>
            </div>
            <p>
              <strong>Experience:</strong> {selectedApplicant.experiencedYears}
            </p>
            <p>
              <strong>Applied On:</strong>{" "}
              {format(new Date(selectedApplicant.appliedAt), "MMM dd,PPPP")}
            </p>
            <p>
              <strong>Status:</strong>
              <span
                className={`ml-2 px-2 py-1 rounded-full text-sm font-semibold ${
                  selectedApplicant.status === "Accepted"
                    ? "bg-green-100 text-green-800"
                    : selectedApplicant.status === "Rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {selectedApplicant.status}
              </span>
            </p>
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Bio:</h4>
              <p className="text-gray-700 whitespace-pre-wrap">
                {selectedApplicant.bio || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Skills:</h4>
              {selectedApplicant.skills &&
              selectedApplicant.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedApplicant.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-200 text-gray-800 text-sm px-3 py-1 rounded-full capitalize"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No skills listed.</p>
              )}
            </div>
            <a
              href={selectedApplicant.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors inline-block mt-4"
            >
              View Full Resume
            </a>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default JobApplications;
