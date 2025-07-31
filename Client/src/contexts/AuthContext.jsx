import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Send cookies with requests for cross-origin
  axios.defaults.withCredentials = true;

  // Checks who is logged in by trying admin, user, then company profiles
  const checkAuthStatus = async () => {
    setLoading(true);
    let loggedInEntity = null;
    let currentRole = null;

    // 1. Try Admin first
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/dashboard`);
      if (res.data.Success) {
        setAdmin({ role: "admin", ...res.data.data });
        setUser(null);
        setCompany(null);
        loggedInEntity = { role: "admin", ...res.data.data };
        currentRole = "admin";
        console.log("[AuthContext] Admin logged in.");
      } else {
        setAdmin(null);
      }
    } catch (err) {
      console.log(
        "[AuthContext] Admin not logged in or fetch failed:",
        err.message
      );
      setAdmin(null);
    }

    // 2. If no admin, try user
    if (!currentRole) {
      try {
        const res = await axios.get(`${API_BASE_URL}/user/profile`);
        if (res.data.Success && res.data.data) {
          setUser(res.data.data);
          setAdmin(null);
          setCompany(null);
          loggedInEntity = { role: "user", ...res.data.data };
          currentRole = "user";
          console.log("[AuthContext] User logged in:", res.data.data);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.log(
          "[AuthContext] User not logged in or fetch failed:",
          err.message
        );
        setUser(null);
      }
    }

    // 3. If no admin or user, try company
    if (!currentRole) {
      try {
        const res = await axios.get(`${API_BASE_URL}/company/profile`);
        if (res.data.Success && res.data.data) {
          setCompany(res.data.data);
          setUser(null);
          setAdmin(null);
          loggedInEntity = { role: "company", ...res.data.data };
          currentRole = "company";
          console.log("[AuthContext] Company logged in:", res.data.data);
        } else {
          setCompany(null);
        }
      } catch (err) {
        console.log(
          "[AuthContext] Company not logged in or fetch failed:",
          err.message
        );
        setCompany(null);
      }
    }

    setLoading(false);
    return loggedInEntity;
  };

  // Login function supports admin, user, or company roles
  const login = async (role, emailOrUsername, password) => {
    try {
      let response;

      if (role === "admin") {
        // Admin login expects username/password
        response = await axios.post(`${API_BASE_URL}/admin/login`, {
          username: emailOrUsername,
          password,
        });
      } else {
        // User/Company login expects email/password with keys like userEmail/userPassword or companyEmail/companyPassword
        response = await axios.post(`${API_BASE_URL}/${role}/login`, {
          [`${role}Email`]: emailOrUsername,
          [`${role}Password`]: password,
        });
      }

      if (response.data.Success) {
        const loggedInEntity = await checkAuthStatus();
        return {
          success: true,
          message: response.data.message,
          entity: loggedInEntity,
          redirLink: response.data.data?.redirLink || null,
        };
      }
      return {
        success: false,
        message: response.data?.Error?.Message || "Login failed",
      };
    } catch (error) {
      console.error(
        "[AuthContext] Login error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.Error?.Message || "Login failed",
      };
    }
  };

  // Logout function for any role
  const logout = async (role) => {
    try {
      // Optimistically clear local state for quick UI update
      setUser(null);
      setCompany(null);
      setAdmin(null);

      await axios.post(`${API_BASE_URL}/${role}/logout`);
      console.log("[AuthContext] Logout successful.");
      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      console.error(
        "[AuthContext] Logout error:",
        error.response?.data || error.message
      );
      return {
        success: false,
        message: error.response?.data?.Error?.Message || "Logout failed",
      };
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, company, admin, loading, login, logout, checkAuthStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
};
