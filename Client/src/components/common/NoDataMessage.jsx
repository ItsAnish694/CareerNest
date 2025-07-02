import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

function NoDataMessage({ message }) {
  return (
    <div
      className="text-center py-10 bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center"
      role="alert"
      aria-live="polite"
    >
      <FontAwesomeIcon
        icon={faExclamationCircle}
        className="text-red-500 text-5xl mb-4"
      />
      <p className="text-xl font-semibold text-gray-700">{message}</p>
      <p className="text-gray-500 mt-2">
        Please check back later or adjust your criteria.
      </p>
    </div>
  );
}

export default NoDataMessage;
