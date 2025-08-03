import React, { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";
import Pagination from "../../components/common/Pagination";
import { AuthContext } from "../../contexts/AuthContext";
import { Link, useSearchParams } from "react-router-dom";
import Modal from "../../components/common/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faEdit,
  faSearch,
  faCheckCircle,
  faInfoCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const companyStatusOptions = [
  {
    label: "Verified",
    value: "verified",
    icon: faCheckCircle,
    color: "text-green-600",
  },
  { label: "Pending", value: "pending", color: "text-yellow-600" },
  { label: "Rejected", value: "rejected", color: "text-red-600" },
  { label: "Unverified", value: "unverified", color: "text-gray-600" },
];

function AdminCompanyList() {
  const { admin, loading: authLoading } = useContext(AuthContext);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCompaniesCount, setTotalCompaniesCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("verified");
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [message, setMessage] = useState({ text: "", type: "" });

  const limit = 10;

  useEffect(() => {
    const pageParam = parseInt(searchParams.get("page")) || 1;
    const qParam = searchParams.get("q") || "";
    const statusParam = searchParams.get("status") || "verified";

    setCurrentPage(pageParam);
    setSearchQuery(qParam);
    setStatusFilter(statusParam);
    setMessage({ text: "", type: "" }); // Clear message on search/filter/page change

    if (!authLoading && admin?.role === "admin") {
      fetchCompanies(pageParam, qParam, statusParam);
    } else if (!authLoading) {
      setLoading(false);
      setCompanies([]);
    }
  }, [authLoading, admin, searchParams]);

  const fetchCompanies = async (page, q, status) => {
    setLoading(true);
    try {
      let url = `/admin/companies?page=${page}&limit=${limit}&status=${status}`;
      if (q) url = `/admin/companies/search?q=${q}`;

      const response = await api.get(url);
      if (response.data.Success) {
        setCompanies(q ? response.data.data : response.data.data.companies);
        setTotalCompaniesCount(
          q ? response.data.data.length : response.data.data.totalDocuments
        );
      } else {
        setCompanies([]);
        setTotalCompaniesCount(0);
      }
    } catch {
      setCompanies([]);
      setTotalCompaniesCount(0);
    } finally {
      setLoading(false);
    }
  };

  const updateSearchParams = (page, q, status) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", page.toString());
    params.set("status", status);
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateSearchParams(page, searchQuery, statusFilter);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    updateSearchParams(1, searchQuery, statusFilter);
  };

  const handleStatusFilterChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    setCurrentPage(1);
    setSearchQuery("");
    updateSearchParams(1, "", newStatus);
  };

  const confirmDeleteCompany = (id) => setCompanyToDelete(id);

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;
    setIsDeleting(true);
    setMessage({ text: "", type: "" });
    try {
      await api.delete(`/admin/companies/${companyToDelete}`);
      setMessage({ text: "Company deleted successfully!", type: "success" });
      setCompanyToDelete(null);
      fetchCompanies(currentPage, searchQuery, statusFilter);
    } catch {
      setMessage({ text: "Failed to delete company.", type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || loading) return <LoadingSpinner />;
  if (!admin || admin.role !== "admin")
    return (
      <NoDataMessage message="Access Denied: You must be logged in as an administrator to view this page." />
    );

  return (
    <div className="max-w-7xl mx-auto bg-white p-4 sm:p-6 rounded-xl shadow-lg my-6 border border-gray-100">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6 border-b pb-3">
        Manage Companies
      </h2>

      {message.text && (
        <div
          className={`flex items-center p-4 mb-6 rounded-md ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <FontAwesomeIcon
            icon={faInfoCircle}
            className={`mr-3 ${
              message.type === "success" ? "text-green-500" : "text-red-500"
            }`}
          />
          <p>{message.text}</p>
          <button
            onClick={() => setMessage({ text: "", type: "" })}
            className="ml-auto text-current hover:opacity-75 transition-opacity"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row flex-1 gap-2"
        >
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full sm:flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faSearch} />
            Search
          </button>
        </form>

        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="w-full md:w-auto p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          disabled={loading}
        >
          {companyStatusOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {companies.length === 0 ? (
        <NoDataMessage
          message={`No companies found${
            searchQuery
              ? ` for "${searchQuery}"`
              : ` with status "${statusFilter}"`
          }.`}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border shadow-sm">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-blue-600 text-white text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Company Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {companies.map((company) => (
                <tr key={company._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 capitalize font-medium">
                    {company.companyName}
                  </td>
                  <td className="px-4 py-3">{company.companyEmail}</td>
                  <td className="px-4 py-3 capitalize">
                    {[
                      company.companyArea,
                      company.companyCity,
                      company.companyDistrict,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                        company.isVerified === "verified"
                          ? "bg-green-100 text-green-800"
                          : company.isVerified === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : company.isVerified === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {company.isVerified}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      to={`/admin/companies/${company._id}`}
                      className="text-indigo-600 hover:text-indigo-800 mr-4"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Link>
                    <button
                      onClick={() => confirmDeleteCompany(company._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalCompaniesCount > limit && !searchQuery && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalItems={totalCompaniesCount}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <Modal
        isOpen={companyToDelete !== null}
        onClose={() => setCompanyToDelete(null)}
        title="Delete Company Account"
        onConfirm={handleDeleteCompany}
        confirmText={
          isDeleting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-4 w-4 text-white mr-2"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4zm2 5.3A8 8 0 014 12H0c0 3 1.1 5.8 3 7.9l3-2.6z"
                />
              </svg>
              Deleting...
            </span>
          ) : (
            "Yes, Delete"
          )
        }
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isConfirmDisabled={isDeleting}
      >
        <p>Are you sure you want to permanently delete this company account?</p>
        <p className="text-sm text-red-500 mt-2">
          This action cannot be undone and will remove all associated job
          postings and applications.
        </p>
      </Modal>
    </div>
  );
}

export default AdminCompanyList;
