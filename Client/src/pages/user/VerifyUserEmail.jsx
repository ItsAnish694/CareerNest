import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function VerifyUserEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState("Verifying...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");

    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus("Error: Verification token missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.post("/user/profile/verifyEmail", { token }); // Backend expects token in body for POST
        if (response.data.Success) {
          setVerificationStatus("Email successfully updated!");
          setTimeout(() => navigate("/user/profile"), 3000); // Redirect after success
        }
      } catch (error) {
        setVerificationStatus(
          `Error: ${
            error.response?.data?.Error?.Message || "Failed to verify email."
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md my-10 text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Email Verification
      </h2>
      {loading ? (
        <>
          <LoadingSpinner />
          <p className="text-gray-700 mt-4">{verificationStatus}</p>
        </>
      ) : (
        <p
          className={`text-lg ${
            verificationStatus.includes("Error")
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {verificationStatus}
        </p>
      )}
    </div>
  );
}

export default VerifyUserEmail;
