import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";
import Pagination from "../../components/common/Pagination";
import Modal from "../../components/common/Modal";
import { AuthContext } from "../../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faFileAlt,
  faEye,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { format } from "date-fns";

function JobApplications() {
  const { jobId } = useParams();
  const { company, loading: authLoading } = useContext(AuthContext);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [jobTitle, setJobTitle] = useState("Job");
  const [modalApp, setModalApp] = useState(null);
  const [statusModal, setStatusModal] = useState({
    open: false,
    app: null,
    status: "",
    subject: "",
    body: "",
  });
  const [isDownloading, setIsDownloading] = useState(false);

  const limit = 10;

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      // Get job title
      const resJobs = await api.get("/company/jobs");
      const foundJob = resJobs.data?.data.find((j) => j._id === jobId);
      if (!foundJob) {
        toast.error("Job not found.");
        setLoading(false);
        return;
      }
      setJobTitle(foundJob.jobTitle);

      // Get applications
      let url = `/company/jobs/${jobId}/applications?limit=${limit}&page=${currentPage}`;
      if (filterStatus) url += `&status=${filterStatus}`;

      const resApps = await api.get(url);
      setApplications(resApps.data?.data || []);
    } catch (err) {
      setApplications([]);
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  }, [jobId, currentPage, filterStatus]);

  useEffect(() => {
    if (!authLoading && company?.isVerified === "verified") {
      fetchApplications();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [fetchApplications, authLoading, company]);

  const handleStatusChange = (app, status) => {
    setStatusModal({
      open: true,
      app,
      status,
      subject: `Application ${status} - ${jobTitle}`,
      body: `Dear ${
        app.name
      },\n\nYour application for "${jobTitle}" has been ${status.toLowerCase()} by ${
        company?.companyName || "our company"
      }.\n\nThank you.`,
    });
  };

  const confirmStatusUpdate = async () => {
    const { app, status, subject, body } = statusModal;
    setStatusModal((prev) => ({ ...prev, open: false }));
    setLoading(true);
    try {
      await api.post(`/company/application/${app._id}?status=${status}`, {
        subject,
        body,
      });
      toast.success(`Application marked as ${status}.`);
      fetchApplications();
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadResume = async (resumeUrl, name) => {
    setIsDownloading(true);
    toast.info("Downloading resume...");
    try {
      const res = await fetch(resumeUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${name.replace(/\s+/g, "_")}_Resume.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Resume downloaded.");
    } catch (err) {
      toast.error("Download failed.");
      console.log(err.message);
    } finally {
      setIsDownloading(false);
    }
  };

  if (authLoading || loading) return <LoadingSpinner />;

  if (!company)
    return (
      <NoDataMessage message="Please log in as a company to view applications." />
    );
  if (company.isVerified !== "verified")
    return (
      <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow text-center my-10">
        <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
        <p className="text-red-600 mb-4">
          Your company account is not verified.
        </p>
        <Link
          to="/company/profile"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition"
        >
          Go to Company Profile
        </Link>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow my-6 border border-gray-100">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 text-center">
        Applications for: <span className="capitalize">{jobTitle}</span>
      </h1>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {["", "Pending", "Accepted", "Rejected"].map((status) => (
          <button
            key={status}
            onClick={() => {
              setFilterStatus(status);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-full font-semibold text-sm transition ${
              filterStatus === status
                ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {status || "All"}
          </button>
        ))}
      </div>

      {applications.length === 0 ? (
        <NoDataMessage message="No applications found." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-gray-50 p-5 rounded-lg shadow hover:shadow-lg transition flex flex-col"
            >
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <img
                  src={app.profilePicture}
                  alt={app.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border flex-shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://res.cloudinary.com/dcsgpah7o/raw/upload/v1750015844/yhfkchms5dvz9we2nvga.png";
                  }}
                />
                <div className="flex-1 min-w-[150px]">
                  <h3 className="text-lg font-semibold capitalize text-gray-900">
                    {app.name}
                  </h3>
                  <p className="text-gray-600 overflow-hidden text-sm">
                    {app.email}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 text-sm mb-1">
                <strong>Experience:</strong> {app.experiencedYears}
              </p>
              <p className="text-gray-700 text-sm mb-1">
                <strong>Applied:</strong>{" "}
                {format(new Date(app.appliedAt), "MMM dd, yyyy")}
              </p>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Status:</strong>{" "}
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                    app.status === "Accepted"
                      ? "bg-green-100 text-green-700"
                      : app.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {app.status}
                </span>
              </p>

              <div className="flex gap-2 mt-auto pt-3 border-t">
                {app.status === "Pending" && (
                  <>
                    <button
                      onClick={() => handleStatusChange(app, "Accepted")}
                      className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition"
                      title="Accept"
                    >
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </button>
                    <button
                      onClick={() => handleStatusChange(app, "Rejected")}
                      className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                      title="Reject"
                    >
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </button>
                  </>
                )}
                <a
                  href={app.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition"
                  title="View Resume"
                >
                  <FontAwesomeIcon icon={faFileAlt} />
                </a>
                <button
                  onClick={() => setModalApp(app)}
                  className="p-2 rounded-full bg-gray-500 text-white hover:bg-gray-600 transition"
                  title="Details"
                >
                  <FontAwesomeIcon icon={faEye} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {applications.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalItems={applications.length * currentPage + 1} // approximate if no total count
            itemsPerPage={limit}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Details Modal */}
      <Modal
        isOpen={!!modalApp}
        onClose={() => setModalApp(null)}
        title={`Details: ${modalApp?.name}`}
        showConfirmButton={false}
      >
        {modalApp && (
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Email:</strong> {modalApp.email}
            </p>
            <p>
              <strong>Experience:</strong> {modalApp.experiencedYears}
            </p>
            <p>
              <strong>Status:</strong> {modalApp.status}
            </p>
            <div>
              <strong>Bio:</strong>
              <p className="whitespace-pre-wrap">{modalApp.bio || "N/A"}</p>
            </div>
            <div>
              <strong>Skills:</strong>
              <div className="flex flex-wrap gap-2 mt-1">
                {modalApp.skills?.map((skill, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full capitalize"
                  >
                    {skill}
                  </span>
                )) || <p>No skills listed.</p>}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <a
                href={modalApp.resume}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
              >
                View Resume
              </a>
              <button
                onClick={() => downloadResume(modalApp.resume, modalApp.name)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm flex items-center"
                disabled={isDownloading}
              >
                {isDownloading ? (
                  "Downloading..."
                ) : (
                  <>
                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                    Download
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Status change modal */}
      <Modal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ ...statusModal, open: false })}
        title={`Confirm ${statusModal.status}`}
        onConfirm={confirmStatusUpdate}
        confirmText={`Confirm ${statusModal.status}`}
        confirmButtonClass={
          statusModal.status === "Accepted"
            ? "bg-green-600 hover:bg-green-700"
            : "bg-red-600 hover:bg-red-700"
        }
      >
        <p className="mb-4">
          Send email to <strong>{statusModal.app?.name}</strong> confirming
          status change.
        </p>
        <div className="space-y-3">
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={statusModal.subject}
            onChange={(e) =>
              setStatusModal((prev) => ({ ...prev, subject: e.target.value }))
            }
          />
          <textarea
            rows="5"
            className="w-full p-2 border rounded resize-y"
            value={statusModal.body}
            onChange={(e) =>
              setStatusModal((prev) => ({ ...prev, body: e.target.value }))
            }
          />
        </div>
      </Modal>
    </div>
  );
}

export default JobApplications;
