// src/contexts/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const API_BASE_URL = "/api/v1";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true); // To indicate if auth status is being checked

  // Configure axios to send cookies
  axios.defaults.withCredentials = true;

  const checkAuthStatus = async () => {
    setLoading(true);
    let loggedInEntity = null; // Initialize to null
    let userLoggedIn = false; // Flag to track if a user was successfully logged in

    try {
      // Attempt to fetch user profile
      const userRes = await axios.get(`${API_BASE_URL}/user/profile`);
      if (userRes.data.Success && userRes.data.data) {
        setUser(userRes.data.data);
        setCompany(null); // Ensure company state is null if user logs in
        loggedInEntity = userRes.data.data;
        userLoggedIn = true; // Mark user as logged in
        console.log(
          "AuthContext: User profile fetched and set:",
          userRes.data.data
        );
      } else {
        setUser(null); // Explicitly clear user if no success or no data
      }
    } catch (userErr) {
      console.log("AuthContext: User profile fetch failed.", userErr.message);
      setUser(null); // Clear user state if fetch fails
    }

    // Only attempt company fetch if a user was NOT successfully logged in
    if (!userLoggedIn) {
      try {
        const companyRes = await axios.get(`${API_BASE_URL}/company/profile`);
        console.log(companyRes);

        if (companyRes.data.Success && companyRes.data.data) {
          setCompany(companyRes.data.data);
          setUser(null); // Ensure user state is null if company logs in
          loggedInEntity = companyRes.data.data;
          console.log(
            "AuthContext: Company profile fetched and set:",
            companyRes.data.data
          );
        } else {
          setCompany(null); // Explicitly clear company if no success or no data
        }
      } catch (companyErr) {
        console.log(
          "AuthContext: Company profile fetch failed. No user or company logged in.",
          companyErr.message
        );
        setCompany(null); // Clear company state if fetch fails
      }
    }

    // Ensure loading is set to false and the entity is returned after all attempts
    setLoading(false);
    console.log(
      "AuthContext: checkAuthStatus completed. LoggedInEntity:",
      loggedInEntity
    );
    return loggedInEntity; // Return the entity outside the finally block
  };

  const login = async (role, email, password) => {
    try {
      console.log(
        `AuthContext: Attempting login for role: ${role}, email: ${email}`
      );
      const response = await axios.post(`${API_BASE_URL}/${role}/login`, {
        [`${role}Email`]: email,
        [`${role}Password`]: password,
      });

      if (response.data.Success) {
        console.log(
          "AuthContext: Login API call successful. Now checking auth status..."
        );
        // After successful login API call, re-check auth status to update context and get fresh data
        const loggedInEntity = await checkAuthStatus(); // This will update user/company state
        console.log(
          "AuthContext: checkAuthStatus after login returned:",
          loggedInEntity
        );
        return {
          success: true,
          message: response.data.message,
          entity: loggedInEntity,
        };
      }
      console.log(
        "AuthContext: Login API call failed (response.data.Success was false)."
      );
      return {
        success: false,
        message: response.data?.Error?.Message || "Login failed",
      };
    } catch (error) {
      console.error(
        "AuthContext: Error during login API call:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.Error?.Message || "Login failed",
      };
    }
  };

  const logout = async (role) => {
    try {
      console.log(`AuthContext: Attempting logout for role: ${role}`);
      await axios.post(`${API_BASE_URL}/${role}/logout`);
      setUser(null);
      setCompany(null);
      console.log(
        "AuthContext: Logout successful. User/Company state cleared."
      );
      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      console.error(
        "AuthContext: Error during logout API call:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.Error?.Message || "Logout failed",
      };
    }
  };

  useEffect(() => {
    console.log("AuthContext: Initial checkAuthStatus on component mount.");
    checkAuthStatus();
  }, []);

  // Log current user/company state whenever it changes (for debugging)
  useEffect(() => {
    console.log(
      "AuthContext State Updated: User:",
      user,
      "Company:",
      company,
      "Loading:",
      loading
    );
  }, [user, company, loading]);

  return (
    <AuthContext.Provider
      value={{ user, company, loading, login, logout, checkAuthStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
};
