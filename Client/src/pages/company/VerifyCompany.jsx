import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function VerifyCompany() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyPhoneNumber: "",
    companyDistrict: "",
    companyCity: "",
    companyArea: "",
  });
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, [token]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

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
        setDocument(null);
        e.target.value = null;
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB.");
        setDocument(null);
        e.target.value = null;
        return;
      }
      setDocument(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!document) {
      toast.error("Please provide the required verification document.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("companyPhoneNumber", form.companyPhoneNumber);
    formData.append("companyDistrict", form.companyDistrict);
    formData.append("companyCity", form.companyCity);
    formData.append("companyArea", form.companyArea);
    formData.append("document", document);

    try {
      const response = await api.post(`/company/verify/${token}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.Success) {
        const link = response.data.data?.redirectLink;
        if (link) {
          window.location.href = link;
        } else {
          navigate("/login");
        }
      }
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="text-center py-10">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md my-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
        Verify Your Company
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Provide your company's contact and location details along with a
        verification document. Your account will remain "Pending" until
        approved.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <InputField
          id="companyPhoneNumber"
          label="Company Phone Number"
          value={form.companyPhoneNumber}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <InputField
          id="companyDistrict"
          label="Company District"
          value={form.companyDistrict}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <InputField
          id="companyCity"
          label="Company City"
          value={form.companyCity}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <InputField
          id="companyArea"
          label="Company Area"
          value={form.companyArea}
          onChange={handleChange}
          disabled={loading}
          required
        />
        <div>
          <label
            htmlFor="document"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Upload Verification Document (PDF, DOC, DOCX, JPG, PNG - Max 5MB)
          </label>
          <input
            type="file"
            id="document"
            accept=".pdf,.doc,.docx,.jpeg,.jpg,.png"
            onChange={handleFileChange}
            disabled={loading}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            (e.g., Company Registration Certificate, Business License)
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors"
        >
          {loading ? <LoadingSpinner size={20} /> : "Submit for Verification"}
        </button>
      </form>
    </div>
  );
}

function InputField({ id, label, value, onChange, disabled, required }) {
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
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default VerifyCompany;
