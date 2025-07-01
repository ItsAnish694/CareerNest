import React from "react";

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-full min-h-[200px]">
      <div className="spinner"></div>
      <p className="ml-3 text-lg text-gray-700">Loading...</p>
    </div>
  );
}

export default LoadingSpinner;
