import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";

function UpdateUserSkills() {
  const {
    user,
    loading: authLoading,
    checkAuthStatus,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentSkills, setCurrentSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      setCurrentSkills(user.skills || []);
    }
  }, [user, authLoading]);

  const handleAddSkill = () => {
    const skillToAdd = newSkillInput.trim().toLowerCase();
    if (skillToAdd && !currentSkills.includes(skillToAdd)) {
      setCurrentSkills([...currentSkills, skillToAdd]);
      setNewSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setCurrentSkills(currentSkills.filter((skill) => skill !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.patch("/user/profile/skills", {
        skills: currentSkills,
      });
      if (response.data.Success) {
        await checkAuthStatus(); // Update user info in context
        navigate("/user/profile");
      }
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <p className="text-center text-red-500">
        Please log in to manage your skills.
      </p>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow-md my-10">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
        Manage Your Skills
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="newSkill"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Add New Skill
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="newSkill"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-grow"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              placeholder="e.g., React, Node.js, Python"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-md shadow-md hover:bg-gray-300 transition-colors px-4 py-2"
              disabled={loading || newSkillInput.trim() === ""}
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Your Current Skills ({currentSkills.length})
          </h3>
          {currentSkills.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {currentSkills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-blue-100 text-blue-800 text-sm font-medium px-4 py-2 rounded-full flex items-center capitalize"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                    disabled={loading}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No skills added yet. Add some to get better job recommendations!
            </p>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 transition-colors w-full flex items-center justify-center"
          disabled={loading}
        >
          {loading ? <LoadingSpinner /> : "Save Skills"}
        </button>
      </form>
    </div>
  );
}

export default UpdateUserSkills;
