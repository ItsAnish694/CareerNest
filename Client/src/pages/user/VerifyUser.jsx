import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const experiencedYearsOptions = [
  "No Experience",
  "Less than 1 year",
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

function VerifyUser() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [experiencedYears, setExperiencedYears] = useState("No Experience");
  const [skills, setSkills] = useState(""); // Comma separated string
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    // Optionally, you might want to call an API to check token validity on load
    // For now, we'll just assume the token is in the URL and attempt to use it on form submission.
    // If the token is invalid/expired, the backend will reject the POST request.
    setInitialCheckDone(true); // Indicate that component is ready to take input
  }, [token]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (
        ![
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/jpeg",
          "image/png",
          "image/jpg",
        ].includes(file.type)
      ) {
        toast.error(
          "Only .pdf, .doc, .docx, .jpeg, .jpg, and .png files are allowed for resume."
        );
        setResume(null);
        e.target.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("File size must be less than 5MB.");
        setResume(null);
        e.target.value = null;
        return;
      }
      setResume(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("phoneNumber", phoneNumber);
    formData.append("district", district);
    formData.append("city", city);
    formData.append("area", area);
    formData.append("experiencedYears", experiencedYears);
    formData.append(
      "skills",
      JSON.stringify(
        skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      )
    );
    if (resume) {
      formData.append("resume", resume);
    } else {
      toast.error("Please provide your resume.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post(`/user/verify/${token}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.Success) {
        // toast.success is handled by interceptor
        navigate("/login"); // User is verified, prompt to login
      }
    } catch (error) {
      // toast.error is handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (!initialCheckDone) {
    return (
      <div className="text-center py-10">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md my-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
        Complete Your Profile
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Please provide the remaining details to verify your account and complete
        your profile.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Phone Number
          </label>
          <input
            type="text"
            id="phoneNumber"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="district"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            District
          </label>
          <input
            type="text"
            id="district"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            City
          </label>
          <input
            type="text"
            id="city"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="area"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Area
          </label>
          <input
            type="text"
            id="area"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label
            htmlFor="experiencedYears"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Years of Experience
          </label>
          <select
            id="experiencedYears"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none custom-select-arrow"
            value={experiencedYears}
            onChange={(e) => setExperiencedYears(e.target.value)}
            required
            disabled={loading}
          >
            {experiencedYearsOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="skills"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Skills (comma-separated, e.g., JavaScript, React, Node.js)
          </label>
          <input
            type="text"
            id="skills"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            required
            disabled={loading}
            placeholder="e.g., HTML, CSS, JavaScript"
          />
        </div>
        <div>
          <label
            htmlFor="resume"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Upload Resume (PDF, DOC, DOCX, JPG, PNG - Max 5MB)
          </label>
          <input
            type="file"
            id="resume"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            accept=".pdf,.doc,.docx,.jpeg,.jpg,.png"
            onChange={handleFileChange}
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors w-full flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <LoadingSpinner variant="inline" />
          ) : (
            "Complete Verification"
          )}
        </button>
      </form>
    </div>
  );
}

export default VerifyUser;
