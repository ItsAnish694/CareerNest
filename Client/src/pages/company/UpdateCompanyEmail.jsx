import { useState, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function UpdateCompanyEmail() {
  const { company, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.patch("/company/profile/email", {
        email: newEmail,
      });
      if (response.data.Success) {
        navigate("/company/profile");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!company) {
    return (
      <p className="text-center text-red-500 mt-10">
        Please log in to change your company email.
      </p>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md my-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
        Change Company Email Address
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Your current email:{" "}
        <span className="font-semibold text-blue-600">
          {company.companyEmail}
        </span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <label
          htmlFor="newEmail"
          className="block text-sm font-medium text-gray-700"
        >
          New Email
          <input
            type="email"
            id="newEmail"
            className="w-full mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            disabled={loading}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors"
        >
          {loading ? (
            <LoadingSpinner variant="inline" />
          ) : (
            "Send Verification Email"
          )}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-600">
        A verification email will be sent to the new address. Please click the
        link in the email to confirm the change.
      </p>
    </div>
  );
}

export default UpdateCompanyEmail;
