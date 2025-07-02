import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function VerifyCompanyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");
    console.log(token);

    const verifyEmail = async () => {
      if (!token) {
        setStatus("Error: Verification token missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await api.post(
          `/company/profile/verifyEmail?token=${token}`
        );

        if (response.data.Success) {
          setStatus("Company email successfully verified!");
          setTimeout(() => navigate("/company/profile"), 3000);
        }
      } catch (error) {
        setStatus(
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
        Company Email Verification
      </h2>
      {loading ? (
        <>
          <LoadingSpinner />
          <p className="text-gray-700 mt-4">{status}</p>
        </>
      ) : (
        <p
          className={`text-lg font-medium ${
            status.includes("Error") ? "text-red-600" : "text-green-600"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
}

export default VerifyCompanyEmail;
