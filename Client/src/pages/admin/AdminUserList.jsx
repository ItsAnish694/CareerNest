import { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";
import Pagination from "../../components/common/Pagination";
import { AuthContext } from "../../contexts/AuthContext";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "../../components/common/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit, faSearch } from "@fortawesome/free-solid-svg-icons";

function AdminUserList() {
  const { admin, loading: authLoading } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const limit = 10;

  useEffect(() => {
    const pageParam = parseInt(searchParams.get("page")) || 1;
    const qParam = searchParams.get("q") || "";

    setCurrentPage(pageParam);
    setSearchQuery(qParam);

    if (!authLoading && admin?.role === "admin") {
      fetchUsers(pageParam, qParam);
    } else if (!authLoading) {
      setLoading(false);
      setUsers([]);
    }
  }, [authLoading, admin, searchParams]);

  const fetchUsers = async (page, q) => {
    setLoading(true);
    try {
      let url = `/admin/users?page=${page}&limit=${limit}`;
      if (q) {
        url = `/admin/users/search?q=${encodeURIComponent(q)}`;
      }
      const response = await api.get(url);
      if (response.data.Success) {
        if (q) {
          setUsers(response.data.data);
          setTotalUsersCount(response.data.data.length);
        } else {
          setUsers(response.data.data.users);
          setTotalUsersCount(response.data.data.totalDocuments);
        }
      } else {
        setUsers([]);
        setTotalUsersCount(0);
      }
    } catch {
      setUsers([]);
      setTotalUsersCount(0);
    } finally {
      setLoading(false);
    }
  };

  const updateSearchParams = (page, q) => {
    const newParams = new URLSearchParams();
    if (q) newParams.set("q", q);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateSearchParams(page, searchQuery);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    updateSearchParams(1, searchQuery);
  };

  const confirmDeleteUser = (userId) => {
    setUserToDelete(userId);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/admin/users/${userToDelete}`);
      toast.success("User deleted successfully!");
      setUserToDelete(null);
      fetchUsers(currentPage, searchQuery);
    } catch {
      // Global error handling assumed
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || loading) return <LoadingSpinner />;

  if (!admin || admin.role !== "admin") {
    return (
      <NoDataMessage message="Access Denied: You must be logged in as an administrator to view this page." />
    );
  }

  return (
    <div className="max-w-full lg:max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-lg my-10 border border-gray-100">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8 border-b-2 pb-3 border-blue-200">
        Manage Job Seekers
      </h2>

      <div className="max-w-xl mx-auto mb-8">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors flex items-center"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faSearch} className="mr-2" /> Search
          </button>
        </form>
      </div>

      {users.length === 0 ? (
        <NoDataMessage message="No job seekers found." />
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider rounded-tl-lg">
                  Full Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider rounded-tr-lg">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((userItem) => (
                <tr
                  key={userItem._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                    {userItem.fullname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {userItem.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                    {[userItem.area, userItem.city, userItem.district]
                      .filter(Boolean)
                      .join(", ")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {userItem.experiencedYears || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <Link
                      to={`/admin/users/${userItem._id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      title="Edit User"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Link>
                    <button
                      onClick={() => confirmDeleteUser(userItem._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete User"
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

      {totalUsersCount > limit && !searchQuery && (
        <div className="mt-8 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalItems={totalUsersCount}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <Modal
        isOpen={userToDelete !== null}
        onClose={() => setUserToDelete(null)}
        title="Delete User Account"
        onConfirm={handleDeleteUser}
        confirmText={
          isDeleting ? <LoadingSpinner variant="inline" /> : "Yes, Delete"
        }
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        isConfirmDisabled={isDeleting}
      >
        <p>Are you sure you want to delete this user account?</p>
        <p className="text-sm text-red-500 mt-2">
          This action cannot be undone and will permanently remove all
          associated data.
        </p>
      </Modal>
    </div>
  );
}

export default AdminUserList;
