import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import Modal from "../../components/common/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSave,
  faTrash,
  faCheckCircle,
  faTimesCircle,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";

function AdminCompanyDetail() {
  const { companyID } = useParams();
  const navigate = useNavigate();
  const { admin, loading: authLoading } = useContext(AuthContext);

  const [company, setCompany] = useState(null);
  const [form, setForm] = useState({
    companyName: "",
    companyEmail: "",
    companyPhoneNumber: "",
    companyBio: "",
    companyLocation: "",
    isVerified: "pending",
  });
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (admin?.role === "admin") {
        fetchCompanyDetail();
      } else {
        setLoading(false);
        setCompany(null);
      }
    }
  }, [authLoading, admin, companyID]);

  async function fetchCompanyDetail() {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/companies/${companyID}`);
      if (data.Success && data.data) {
        const c = data.data;
        setCompany(c);
        setForm({
          companyName: c.companyName || "",
          companyEmail: c.companyEmail || "",
          companyPhoneNumber: c.companyPhoneNumber || "",
          companyBio: c.companyBio || "",
          companyLocation: [c.companyArea, c.companyCity, c.companyDistrict]
            .filter(Boolean)
            .join(", "),
          isVerified: c.isVerified || "pending",
        });
      } else {
        setCompany(null);
      }
    } catch {
      setCompany(null);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = ({ target: { id, value } }) => {
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    const [companyArea = "", companyCity = "", companyDistrict = ""] =
      form.companyLocation.split(",").map((s) => s.trim());

    try {
      const { data } = await api.put(`/admin/companies/${companyID}`, {
        companyName: form.companyName,
        companyEmail: form.companyEmail,
        companyPhoneNumber: form.companyPhoneNumber,
        companyBio: form.companyBio,
        companyArea,
        companyCity,
        companyDistrict,
      });
      if (data.Success) {
        toast.success("Company profile updated successfully!");
        setCompany(data.data);
        navigate("/admin/companies");
      }
    } catch {
      toast.error("Failed to update company profile.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    setIsProcessing(true);
    try {
      const { data } = await api.patch(
        `/admin/companies/${companyID}?status=${status}`
      );
      if (data.Success) {
        toast.success(`Company status updated to ${status} and email sent!`);
        setCompany(data.data);
        setForm((prev) => ({ ...prev, isVerified: status }));
        navigate("/admin/companies");
      } else {
        toast.error(data.Error?.Message || "Status update failed.");
      }
    } catch {
      toast.error("Status update failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteCompany = async () => {
    setIsConfirmingDelete(false);
    setIsProcessing(true);
    try {
      await api.delete(`/admin/companies/${companyID}`);
      toast.success("Company account deleted successfully!");
      navigate("/admin/companies");
    } catch {
      toast.error("Failed to delete company account.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (authLoading || loading) return <LoadingSpinner />;

  if (!admin || admin.role !== "admin")
    return (
      <NoDataMessage message="Access Denied: You must be logged in as an administrator to view this page." />
    );

  if (!company) return <NoDataMessage message="Company not found." />;

  const canAccept =
    !isProcessing &&
    (company.isVerified === "pending" || company.isVerified === "rejected") &&
    company.document;

  const canReject =
    !isProcessing &&
    (company.isVerified === "pending" || company.isVerified === "verified") &&
    company.document;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-md my-10 border border-gray-200">
      <button
        onClick={() => navigate("/admin/companies")}
        className="inline-flex items-center mb-8 text-gray-600 hover:text-gray-900 transition"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back to
        Companies
      </button>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-900 mb-8 border-b-4 border-blue-400 pb-4">
        Edit Company: {company.companyName}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          id="companyName"
          label="Company Name"
          value={form.companyName}
          onChange={handleChange}
          disabled={isProcessing}
          required
        />
        <InputField
          id="companyEmail"
          label="Company Email"
          type="email"
          value={form.companyEmail}
          onChange={handleChange}
          disabled={isProcessing}
          required
        />
        <InputField
          id="companyPhoneNumber"
          label="Company Phone Number"
          value={form.companyPhoneNumber}
          onChange={handleChange}
          disabled={isProcessing}
          required
        />
        <TextAreaField
          id="companyBio"
          label="Company Bio"
          value={form.companyBio}
          onChange={handleChange}
          disabled={isProcessing}
          placeholder="Tell us about the company..."
        />
        <InputField
          id="companyLocation"
          label="Company Location (Area, City, District)"
          value={form.companyLocation}
          onChange={handleChange}
          disabled={isProcessing}
          required
          helperText="e.g., Ramailo Chowk, Bharatpur, Chitwan"
        />

        <DocumentsLinkField label="Company Documents" link={company.document} />

        <section className="border rounded-md p-6 bg-gray-50">
          <h3 className="text-xl font-semibold text-gray-800 mb-5">
            Verification Status
          </h3>

          <div className="mb-5">
            <span
              className={`inline-block px-4 py-1 text-sm font-semibold rounded-full capitalize ${
                company.isVerified === "verified"
                  ? "bg-green-200 text-green-800"
                  : company.isVerified === "pending"
                  ? "bg-yellow-200 text-yellow-800"
                  : company.isVerified === "rejected"
                  ? "bg-red-200 text-red-800"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Current Status: {company.isVerified}
            </span>
          </div>

          {(!company.document || company.isVerified === "unverified") && (
            <p className="text-red-600 text-sm mb-6">
              Cannot change verification status. Documents may be missing or
              request not yet sent.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={() => handleUpdateStatus("verified")}
              disabled={!canAccept}
              className={`flex-1 flex justify-center items-center py-3 rounded-md font-semibold transition-colors ${
                !canAccept
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {isProcessing && form.isVerified === "verified" ? (
                <LoadingSpinnerInline text="Updating..." />
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />{" "}
                  Accept
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleUpdateStatus("rejected")}
              disabled={!canReject}
              className={`flex-1 flex justify-center items-center py-3 rounded-md font-semibold transition-colors ${
                !canReject
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {isProcessing && form.isVerified === "rejected" ? (
                <LoadingSpinnerInline text="Updating..." />
              ) : (
                <>
                  <FontAwesomeIcon icon={faTimesCircle} className="mr-2" />{" "}
                  Reject
                </>
              )}
            </button>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <button
            type="submit"
            disabled={isProcessing}
            className="flex-1 flex justify-center items-center py-4 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors"
          >
            {isProcessing ? (
              <LoadingSpinnerInline text="Updating..." />
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} className="mr-2" /> Update
                Company
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            disabled={isProcessing}
            className="flex-1 flex justify-center items-center py-4 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-700 transition-colors"
          >
            <FontAwesomeIcon icon={faTrash} className="mr-2" /> Delete Company
          </button>
        </div>
      </form>

      <Modal
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        title="Confirm Company Deletion"
        onConfirm={handleDeleteCompany}
        confirmText={
          isProcessing ? (
            <LoadingSpinnerInline text="Deleting..." />
          ) : (
            "Yes, Delete Permanently"
          )
        }
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isConfirmDisabled={isProcessing}
      >
        <p className="mb-2">
          Are you sure you want to permanently delete this company account?
        </p>
        <p className="text-sm text-red-600">
          This action cannot be undone and will remove all associated job
          postings and applications.
        </p>
      </Modal>
    </div>
  );
}

function LoadingSpinnerInline({ text }) {
  return (
    <span className="flex items-center justify-center w-full h-full">
      <svg
        className="animate-spin h-5 w-5 text-white mr-3"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span className="text-white font-medium">{text}</span>
    </span>
  );
}

function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  disabled,
  required,
  helperText,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      />
      {helperText && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
}

function TextAreaField({ id, label, value, onChange, disabled, placeholder }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] transition"
      />
    </div>
  );
}

function DocumentsLinkField({ label, link }) {
  return (
    <div>
      <p className="block text-sm font-medium text-gray-700 mb-2">{label}:</p>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors font-semibold shadow-sm"
        >
          <FontAwesomeIcon icon={faFileAlt} className="mr-2" /> View Documents
        </a>
      ) : (
        <p className="text-gray-500 text-sm">No documents provided.</p>
      )}
    </div>
  );
}

export default AdminCompanyDetail;
