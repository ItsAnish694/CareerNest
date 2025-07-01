import React, { useState, useContext } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom"; // Import Link
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const jobTypeOptions = [
  "full time",
  "part time",
  "internship",
  "contract",
  "freelance",
  "remote",
];
const experienceLevelOptions = ["entry-level", "mid-level", "senior-level"];

function CreateJobPosting() {
  const { company, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState(""); // Comma separated
  const [jobType, setJobType] = useState("full time");
  const [requiredExperience, setRequiredExperience] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("entry-level");
  const [salary, setSalary] = useState("");
  const [vacancies, setVacancies] = useState(1);
  const [applicationDeadline, setApplicationDeadline] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (company.isVerified !== "Verified") {
      toast.error("Your company must be verified to post jobs.");
      setLoading(false);
      return;
    }

    const skillsArray = requiredSkills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (skillsArray.length === 0) {
      toast.error("Please provide at least one required skill.");
      setLoading(false);
      return;
    }

    const jobData = {
      jobTitle,
      jobDescription,
      requiredSkills: skillsArray,
      jobType,
      requiredExperience,
      experienceLevel,
      salary: salary || "Negotiable", // Use default if empty
      vacancies: Number(vacancies),
      applicationDeadline,
    };

    try {
      const response = await api.post("/company/jobs", jobData);
      if (response.data.Success) {
        // toast.success is handled by interceptor
        navigate("/company/jobs");
      }
    } catch (error) {
      // toast.error is handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!company || company.isVerified !== "Verified") {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md my-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Access Denied</h2>
        <p className="text-lg text-red-600 mb-4">
          Your company account must be verified to create job postings.
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
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md my-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
        Create New Job Posting
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="jobTitle"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Job Title
          </label>
          <input
            type="text"
            id="jobTitle"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="jobDescription"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Job Description
          </label>
          <textarea
            id="jobDescription"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            required
            disabled={loading}
          ></textarea>
        </div>
        <div>
          <label
            htmlFor="requiredSkills"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Required Skills (comma-separated, e.g., React, Node.js, SQL)
          </label>
          <input
            type="text"
            id="requiredSkills"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="jobType"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Job Type
          </label>
          <select
            id="jobType"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none custom-select-arrow"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            required
            disabled={loading}
          >
            {jobTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="requiredExperience"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Required Experience (e.g., 2+ years, Fresh Graduate)
          </label>
          <input
            type="text"
            id="requiredExperience"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={requiredExperience}
            onChange={(e) => setRequiredExperience(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="experienceLevel"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Experience Level
          </label>
          <select
            id="experienceLevel"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none custom-select-arrow"
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            required
            disabled={loading}
          >
            {experienceLevelOptions.map((option) => (
              <option key={option} value={option}>
                {option
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="salary"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Salary (Optional, e.g., $50,000 - $70,000 per year)
          </label>
          <input
            type="text"
            id="salary"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            disabled={loading}
            placeholder="e.g., Negotiable or a specific range"
          />
        </div>
        <div>
          <label
            htmlFor="vacancies"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Number of Vacancies
          </label>
          <input
            type="number"
            id="vacancies"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={vacancies}
            onChange={(e) => setVacancies(Math.max(1, Number(e.target.value)))} // Ensure min 1
            min="1"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="applicationDeadline"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Application Deadline
          </label>
          <input
            type="date"
            id="applicationDeadline"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={applicationDeadline}
            onChange={(e) => setApplicationDeadline(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors w-full flex items-center justify-center"
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : "Post Job"}
        </button>
      </form>
    </div>
  );
}

export default CreateJobPosting;
