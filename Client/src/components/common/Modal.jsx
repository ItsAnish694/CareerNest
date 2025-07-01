import React from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

function Modal({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText,
  confirmButtonClass = "bg-blue-600 hover:bg-blue-700",
  showConfirmButton = true,
}) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 sm:p-6">
      <div
        className={`bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-sm sm:max-w-md md:max-w-lg w-full mx-auto transition-all duration-300 ease-out
        ${
          isOpen
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0 pointer-events-none"
        }
    `}
      >
        <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Close modal"
          >
            <FontAwesomeIcon icon={faTimes} className="text-lg sm:text-xl" />
          </button>
        </div>
        <div className="text-gray-700 text-base sm:text-lg mb-6 leading-relaxed">
          {children}
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors duration-200 text-base sm:text-lg"
          >
            Cancel
          </button>
          {showConfirmButton && (
            <button
              onClick={onConfirm}
              className={`w-full sm:w-auto px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 text-base sm:text-lg ${confirmButtonClass}`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.getElementById("root") // Append modal to root element
  );
}

export default Modal;
