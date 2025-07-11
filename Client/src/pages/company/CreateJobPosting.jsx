import React, { useState, useContext } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { AuthContext } from "../../contexts/AuthContext";

const jobTypeOptions = [
  "full time",
  "part time",
  "internship",
  "contract",
  "freelance",
  "remote",
];

const experienceLevelOptions = ["entry-level", "mid-level", "senior-level"];

const experienceYearsOptions = [
  "No Experience",
  "1 year",
  "2 years",
  "3 years",
  "4 years",
  "5 years",
  "6 years",
  "7 years",
  "8 years",
  "9 years",
  "10+ years",
];

function CreateJobPosting() {
  const { company, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    jobTitle: "",
    jobDescription: "",
    requiredSkills: "",
    jobType: "full time",
    requiredExperience: "1 year",
    experienceLevel: "entry-level",
    salary: "",
    vacancies: 1,
    applicationDeadline: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [id]: id === "vacancies" ? Math.max(1, Number(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (company.isVerified !== "Verified") {
      setLoading(false);
      return;
    }

    const skillsArray = form.requiredSkills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!skillsArray.length) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const jobData = {
        ...form,
        requiredSkills: skillsArray,
        salary: form.salary || "Negotiable",
      };

      const response = await api.post("/company/jobs", jobData);

      if (response.data.Success) {
        navigate("/company/jobs");
      }
    } catch {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (authLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );

  if (!company || company.isVerified !== "Verified") {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md my-10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Access Denied</h2>
        <p className="text-lg text-red-600 mb-4">
          Your company account must be verified to create job postings.
        </p>
        <p className="text-gray-700 mb-6">
          Please complete and get approval for your company profile
          verification.
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
        {[
          {
            id: "jobTitle",
            label: "Job Title",
            type: "text",
            required: true,
          },
          {
            id: "jobDescription",
            label: "Job Description",
            type: "textarea",
            required: true,
            minHeight: 150,
          },
          {
            id: "requiredSkills",
            label:
              "Required Skills (comma-separated, e.g., React, Node.js, SQL)",
            type: "text",
            required: true,
          },
          {
            id: "jobType",
            label: "Job Type",
            type: "select",
            options: jobTypeOptions,
            required: true,
          },
          {
            id: "requiredExperience",
            label: "Required Experience (years)",
            type: "select",
            options: experienceYearsOptions,
            required: true,
          },
          {
            id: "experienceLevel",
            label: "Experience Level",
            type: "select",
            options: experienceLevelOptions,
            required: true,
            formatOption: (opt) =>
              opt
                .split("-")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" "),
          },
          {
            id: "salary",
            label: "Salary (Optional, e.g., $50,000 - $70,000 per year)",
            type: "text",
            required: false,
            placeholder: "e.g., Negotiable or a specific range",
          },
          {
            id: "vacancies",
            label: "Number of Vacancies",
            type: "number",
            required: true,
            min: 1,
          },
          {
            id: "applicationDeadline",
            label: "Application Deadline",
            type: "date",
            required: true,
          },
        ].map(
          ({
            id,
            label,
            type,
            options,
            required,
            placeholder,
            minHeight,
            min,
            formatOption,
          }) => (
            <div key={id}>
              <label
                htmlFor={id}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {label}
              </label>
              {type === "textarea" ? (
                <textarea
                  id={id}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form[id]}
                  onChange={handleChange}
                  required={required}
                  disabled={loading}
                  style={{ minHeight: minHeight || undefined }}
                />
              ) : type === "select" ? (
                <select
                  id={id}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none custom-select-arrow"
                  value={form[id]}
                  onChange={handleChange}
                  required={required}
                  disabled={loading}
                >
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {formatOption
                        ? formatOption(option)
                        : option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={id}
                  type={type}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form[id]}
                  onChange={handleChange}
                  required={required}
                  disabled={loading}
                  placeholder={placeholder}
                  min={min}
                />
              )}
            </div>
          )
        )}
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors w-full flex items-center justify-center"
          disabled={loading}
        >
          {loading ? <LoadingSpinner variant="inline" /> : "Post Job"}
        </button>
      </form>
    </div>
  );
}

export default CreateJobPosting;
