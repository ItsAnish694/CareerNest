import { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { toast } from "react-toastify";

function UpdateResume() {
  const {
    user,
    loading: authLoading,
    checkAuthStatus,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);

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
          "Only .pdf, .doc, .docx, .jpeg, .jpg, and .png files are allowed."
        );
        setResumeFile(null);
        e.target.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB.");
        setResumeFile(null);
        e.target.value = null;
        return;
      }
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!resumeFile) {
      toast.error("Please select a new resume file.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      const response = await api.patch("/user/profile/resume", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.Success) {
        await checkAuthStatus();
        navigate("/user/profile");
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <p className="text-center text-red-500">
        Please log in to update your resume.
      </p>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md my-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
        Update Resume
      </h2>
      <div className="mb-6 text-center">
        {user.resumeLink ? (
          <a
            href={user.resumeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-lg font-medium"
          >
            View Current Resume
          </a>
        ) : (
          <p className="text-gray-500">No resume uploaded yet.</p>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="resume"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Choose New Resume (PDF, DOC, DOCX, JPG, PNG - Max 5MB)
          </label>
          <input
            type="file"
            id="resume"
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            accept=".pdf,.doc,.docx,.jpeg,.jpg,.png"
            onChange={handleFileChange}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors w-full flex items-center justify-center"
          disabled={loading || !resumeFile}
        >
          {loading ? <LoadingSpinner variant="inline" /> : "Update Resume"}
        </button>
      </form>
    </div>
  );
}

export default UpdateResume;
