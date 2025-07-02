import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";
import { AuthContext } from "../../contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookmark,
  faBriefcase,
  faMapMarkerAlt,
  faDollarSign,
  faUsers,
  faClock,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../components/common/Modal"; // Assuming you create a Modal component

function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const {
    user,
    company,
    loading: authLoading,
    checkAuthStatus,
  } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConfirmingApply, setIsConfirmingApply] = useState(false);
  const [isConfirmingDeleteApplication, setIsConfirmingDeleteApplication] =
    useState(false);
  const [isConfirmingDeleteBookmark, setIsConfirmingDeleteBookmark] =
    useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    // checkApplicationAndBookmarkStatus();
  }, [jobId, user, company]); // Re-fetch if user/company context changes

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      // Assuming the API endpoint /user/jobs?jobId=${jobId} now directly returns the single job object
      // if found, or null/empty data if not.
      const response = await api.get(`/user/jobs?jobID=${jobId}`);

      if (response.data.Success && response.data.data) {
        setJob(response.data.data);
        setIsApplied(response.data.data.isApplied);
        setIsBookmarked(response.data.data.isBookmarked); // Directly set the fetched data as the job
      } else {
        setJob(null); // No job found or success is false
      }
    } catch (error) {
      setJob(null); // Set job to null on error
      // Error handled by interceptor (e.g., toast.error)
    } finally {
      setLoading(false);
    }
  };

  // const checkApplicationAndBookmarkStatus = async () => {
  //   if (!user || authLoading) {
  //     setIsApplied(false);
  //     setIsBookmarked(false);
  //     return;
  //   }
  //   try {
  //     // Check if applied
  //     const appliedRes = await api.get("/user/applications");
  //     if (appliedRes.data.Success && appliedRes.data.data) {
  //       setIsApplied(appliedRes.data.data.some((app) => app._id === jobId));
  //     }

  //     // Check if bookmarked
  //     const bookmarkRes = await api.get("/user/bookmarks");
  //     if (bookmarkRes.data.Success && bookmarkRes.data.data) {
  //       setIsBookmarked(bookmarkRes.data.data.some((bm) => bm._id === jobId));
  //     }
  //   } catch (error) {
  //     console.error("Failed to check application/bookmark status:", error);
  //     setIsApplied(false);
  //     setIsBookmarked(false);
  //   }
  // };

  const handleApplyJob = async () => {
    setIsConfirmingApply(false); // Close modal
    if (!user) {
      toast.info("Please log in as a job seeker to apply.");
      navigate("/login");
      return;
    }
    if (!user.isVerified) {
      toast.warn(
        "Please complete your profile verification to apply for jobs."
      );
      navigate("/user/profile");
      return;
    }

    try {
      await api.post(`/user/applications/${jobId}`);
      // toast.success is handled by interceptor
      setIsApplied(true);
      checkAuthStatus(); // Update application count in context
    } catch (error) {
      // toast.error is handled by interceptor
    }
  };

  const handleDeleteApplication = async () => {
    setIsConfirmingDeleteApplication(false); // Close modal
    try {
      await api.delete(`/user/applications/${jobId}`);
      setIsApplied(false);
      checkAuthStatus(); // Update application count in context
    } catch (error) {
      // toast.error is handled by interceptor
    }
  };

  const handleAddBookmark = async () => {
    if (!user) {
      toast.info("Please log in as a job seeker to bookmark jobs.");
      navigate("/login");
      return;
    }
    try {
      await api.post(`/user/bookmarks/${jobId}`);
      // toast.success is handled by interceptor
      setIsBookmarked(true);
      checkAuthStatus(); // Update bookmark count in context
    } catch (error) {
      // toast.error is handled by interceptor
    }
  };

  const handleDeleteBookmark = async () => {
    setIsConfirmingDeleteBookmark(false); // Close modal
    try {
      await api.delete(`/user/bookmarks/${jobId}`);
      // toast.success is handled by interceptor
      setIsBookmarked(false);
      checkAuthStatus(); // Update bookmark count in context
    } catch (error) {
      // toast.error is handled by interceptor
    }
  };

  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

  if (!job) {
    return <NoDataMessage message="Job not found or has been removed." />;
  }

  // Check if current user is the company that posted the job
  const isCompanyOwner =
    company && job.companyInfo && company._id === job.companyInfo._id;

  return (
    <div className="max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl md:shadow-2xl my-6 sm:my-8 md:my-10 border border-gray-100">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 sm:mb-8 px-4 py-2 sm:px-5 sm:py-2 bg-gray-200 text-gray-700 rounded-md sm:rounded-lg hover:bg-gray-300 transition-colors flex items-center font-semibold text-base sm:text-lg shadow-sm"
      >
        <i className="fas fa-arrow-left mr-2 sm:mr-3"></i> Go Back
      </button>

      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 capitalize mb-2 sm:mb-3 leading-tight">
          {job.jobTitle}
        </h1>
        <p className="text-xl sm:text-2xl font-semibold text-blue-800">
          {job.companyInfo?.companyName || "Unknown Company"}
        </p>
      </div>

      {/* Job Overview Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 sm:gap-y-5 sm:gap-x-8 text-gray-700 text-base sm:text-lg mb-8 sm:mb-10 p-4 sm:p-6 bg-blue-50 rounded-lg sm:rounded-xl shadow-inner border border-blue-100">
        {job.companyInfo?.companyLocation?.city && (
          <span className="flex items-center capitalize">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="mr-3 sm:mr-4 text-blue-600 text-lg sm:text-xl"
            />
            {job.companyInfo.companyLocation.city},{" "}
            {job.companyInfo.companyLocation.district}
          </span>
        )}
        {job.salary && (
          <span className="flex items-center capitalize">
            <FontAwesomeIcon
              icon={faDollarSign}
              className="mr-3 sm:mr-4 text-blue-600 text-lg sm:text-xl"
            />
            {job.salary}
          </span>
        )}
        {job.vacancies > 0 && (
          <span className="flex items-center">
            <FontAwesomeIcon
              icon={faUsers}
              className="mr-3 sm:mr-4 text-blue-600 text-lg sm:text-xl"
            />
            {job.vacancies} Vacancies
          </span>
        )}
        {job.jobType && (
          <span className="flex items-center capitalize">
            <FontAwesomeIcon
              icon={faClock}
              className="mr-3 sm:mr-4 text-blue-600 text-lg sm:text-xl"
            />
            {job.jobType}
          </span>
        )}
        {job.experienceLevel && (
          <span className="flex items-center capitalize">
            <FontAwesomeIcon
              icon={faBriefcase}
              className="mr-3 sm:mr-4 text-blue-600 text-lg sm:text-xl"
            />
            {job.experienceLevel} Experience
          </span>
        )}
        {job.applicationDeadline && (
          <span className="flex items-center text-sm sm:text-base lg:text-lg">
            {" "}
            {/* Responsive text size */}
            <FontAwesomeIcon
              icon={faCalendarAlt}
              className="mr-2 sm:mr-3 lg:mr-4 text-blue-600 text-base sm:text-lg lg:text-xl"
            />{" "}
            {/* Responsive icon size */}
            Deadline:{" "}
            {format(new Date(job.applicationDeadline), "MMMM do,PPPP (EEEE)")}
          </span>
        )}
      </div>

      {/* Job Description Section */}
      <div className="bg-white p-6 sm:p-8 rounded-lg sm:rounded-xl shadow-md mb-6 sm:mb-8 border border-gray-200">
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-5 border-b-2 pb-2 sm:pb-3 border-blue-200">
          Job Description
        </h3>
        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
          {job.jobDescription}
        </p>
      </div>

      {/* Skills and Experience Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-10">
        <div className="bg-white p-6 sm:p-8 rounded-lg sm:rounded-xl shadow-md border border-gray-200">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-5 border-b-2 pb-2 sm:pb-3 border-blue-200">
            Required Skills
          </h3>
          {job.requiredSkills && job.requiredSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {job.requiredSkills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-800 text-sm sm:text-base font-medium px-4 py-1.5 sm:px-5 sm:py-2 rounded-full capitalize shadow-sm hover:bg-purple-200 transition-colors"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm sm:text-base">
              No specific skills listed.
            </p>
          )}
        </div>
        <div className="bg-white p-6 sm:p-8 rounded-lg sm:rounded-xl shadow-md border border-gray-200">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-5 border-b-2 pb-2 sm:pb-3 border-blue-200">
            Experience & Level
          </h3>
          <p className="text-gray-700 text-base sm:text-lg mb-2 sm:mb-3">
            <strong className="font-semibold">Required Experience:</strong>{" "}
            {job.requiredExperience}
          </p>
          <p className="text-gray-700 text-base sm:text-lg capitalize">
            <strong className="font-semibold">Experience Level:</strong>{" "}
            {job.experienceLevel}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
        {user && user.role === "user" && (
          <>
            {!isApplied ? (
              <button
                onClick={() => setIsConfirmingApply(true)}
                className="px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
              >
                Apply Now
              </button>
            ) : (
              <button
                onClick={() => setIsConfirmingDeleteApplication(true)}
                className="px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:from-red-700 hover:to-rose-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75"
              >
                Withdraw Application
              </button>
            )}

            {!isBookmarked ? (
              <button
                onClick={handleAddBookmark}
                className="px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-4 bg-gray-200 text-gray-800 font-bold rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
              >
                <FontAwesomeIcon icon={faBookmark} className="mr-2 sm:mr-3" />{" "}
                Bookmark
              </button>
            ) : (
              <button
                onClick={() => setIsConfirmingDeleteBookmark(true)}
                className="px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-4 bg-yellow-500 text-white font-bold rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
              >
                <FontAwesomeIcon icon={faBookmark} className="mr-2 sm:mr-3" />{" "}
                Remove Bookmark
              </button>
            )}
          </>
        )}
        {isCompanyOwner && (
          <Link
            to={`/company/jobs/${job._id}/applications`}
            className="px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold rounded-lg sm:rounded-xl shadow-md sm:shadow-lg hover:from-purple-700 hover:to-fuchsia-700 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75"
          >
            View Applications ({job.applicationCount})
          </Link>
        )}
      </div>

      {/* Confirmation Modals (assuming Modal component structure is compatible) */}
      <Modal
        isOpen={isConfirmingApply}
        onClose={() => setIsConfirmingApply(false)}
        title="Confirm Application"
        onConfirm={handleApplyJob}
        confirmText="Yes, Apply"
      >
        <p>
          Are you sure you want to apply for this job? Your latest resume will
          be submitted.
        </p>
      </Modal>

      <Modal
        isOpen={isConfirmingDeleteApplication}
        onClose={() => setIsConfirmingDeleteApplication(false)}
        title="Withdraw Application"
        onConfirm={handleDeleteApplication}
        confirmText="Yes, Withdraw"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      >
        <p>Are you sure you want to withdraw your application for this job?</p>
      </Modal>

      <Modal
        isOpen={isConfirmingDeleteBookmark}
        onClose={() => setIsConfirmingDeleteBookmark(false)}
        title="Remove Bookmark"
        onConfirm={handleDeleteBookmark}
        confirmText="Yes, Remove"
        confirmButtonClass="bg-yellow-600 hover:bg-yellow-700"
      >
        <p>Are you sure you want to remove this job from your bookmarks?</p>
      </Modal>
    </div>
  );
}

export default JobDetails;
