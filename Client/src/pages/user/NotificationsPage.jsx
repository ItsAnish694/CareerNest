import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import NoDataMessage from "../../components/common/NoDataMessage";
import { AuthContext } from "../../contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faArrowLeft,
  faClock,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

function NotificationsPage() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user && user.role === "user") {
      fetchNotifications();
    } else if (!authLoading && (!user || user.role !== "user")) {
      setLoading(false);
      // Optionally redirect
      // navigate('/login');
    }
  }, [user, authLoading]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get("/user/profile/notifications");

      if (response.data.Success) {
        setNotifications(response.data.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      setNotifications([]);
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!user || user.role !== "user") {
    return (
      <NoDataMessage message="Please log in as a job seeker to view your notifications." />
    );
  }

  return (
    <div className="max-w-full sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl md:shadow-2xl my-6 sm:my-8 md:my-10 border border-gray-100">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 sm:mb-8 px-4 py-2 sm:px-5 sm:py-2 bg-gray-200 text-gray-700 rounded-md sm:rounded-lg hover:bg-gray-300 transition-colors flex items-center font-semibold text-base sm:text-lg shadow-sm"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2 sm:mr-3" /> Go Back
      </button>

      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 capitalize mb-2 sm:mb-3 leading-tight flex items-center justify-center">
          <FontAwesomeIcon icon={faBell} className="mr-3 text-blue-600" /> My
          Notifications
        </h1>
        <p>Unread Notifications Of Past ~7 Days</p>
      </div>

      {notifications.length === 0 ? (
        <NoDataMessage message="You have no notifications." />
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`relative bg-white p-4 sm:p-6 rounded-lg shadow-md border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3
                ${
                  !notification.isViewed
                    ? "opacity-100 border-blue-300"
                    : "opacity-60 border-gray-200"
                }`}
            >
              <div className="flex-grow">
                <p className="text-lg sm:text-xl font-semibold text-red-700 mb-1">
                  <FontAwesomeIcon
                    icon={faTrashAlt}
                    className="mr-2 text-red-500"
                  />
                  The{" "}
                  {notification.jobTitle
                    .split(" ")
                    .map(
                      (val) =>
                        val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
                    )
                    .join(" ")}{" "}
                  Job You Applied For Has Been Deleted By{" "}
                  {notification.companyName
                    ? notification.companyName + "."
                    : "its company."}
                </p>
                <p
                  className="text-gray-500 text-xs sm:text-sm"
                  title={new Date(notification.createdAt).toLocaleString()}
                >
                  <FontAwesomeIcon
                    icon={faClock}
                    className="mr-2 text-gray-400"
                  />
                  Received:{" "}
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationsPage;
