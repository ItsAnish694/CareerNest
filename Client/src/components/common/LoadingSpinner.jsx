function LoadingSpinner({
  variant = "page", // "page" or "inline"
  message = "Loading...",
  subMessage = "Please wait a moment.",
  size = 64, // px size for page variant
}) {
  if (variant === "inline") {
    // small spinner only, no text, for buttons
    return (
      <svg
        className="animate-spin text-white"
        style={{ width: 20, height: 20 }}
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
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );
  }

  // Default: page variant
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] bg-white bg-opacity-90 rounded-lg shadow p-6 my-6">
      <svg
        style={{ width: size, height: size }}
        className="animate-spin text-blue-600 mb-4"
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
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <p className="text-lg font-medium text-gray-700 animate-pulse">
        {message}
      </p>
      <p className="text-sm text-gray-500 mt-1">{subMessage}</p>
    </div>
  );
}

export default LoadingSpinner;
