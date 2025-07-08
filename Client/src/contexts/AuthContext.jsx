import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const API_BASE_URL = "/api/v1";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  axios.defaults.withCredentials = true;

  const checkAuthStatus = async () => {
    setLoading(true);
    let loggedInEntity = null;

    try {
      const userRes = await axios.get(`${API_BASE_URL}/user/profile`);
      if (userRes.data.Success && userRes.data.data) {
        setUser(userRes.data.data);
        setCompany(null);
        loggedInEntity = userRes.data.data;
        console.log("AuthContext: User logged in:", userRes.data.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.log("AuthContext: User profile fetch failed.", err.message);
      setUser(null);
    }

    if (!loggedInEntity) {
      try {
        const companyRes = await axios.get(`${API_BASE_URL}/company/profile`);
        if (companyRes.data.Success && companyRes.data.data) {
          setCompany(companyRes.data.data);
          console.log(companyRes.data.data);

          setUser(null);
          loggedInEntity = companyRes.data.data;
          console.log("AuthContext: Company logged in:", companyRes.data.data);
        } else {
          setCompany(null);
        }
      } catch (err) {
        console.log("AuthContext: Company profile fetch failed.", err.message);
        setCompany(null);
      }
    }

    setLoading(false);
    return loggedInEntity;
  };

  const login = async (role, email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/${role}/login`, {
        [`${role}Email`]: email,
        [`${role}Password`]: password,
      });

      if (response.data.Success) {
        const loggedInEntity = await checkAuthStatus();
        return {
          success: true,
          message: response.data.message,
          entity: loggedInEntity,
        };
      }
      return {
        success: false,
        message: response.data?.Error?.Message || "Login failed",
      };
    } catch (error) {
      console.error(
        "AuthContext: Login error:",
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
      await axios.post(`${API_BASE_URL}/${role}/logout`);
      setUser(null);
      setCompany(null);
      console.log("AuthContext: Logged out successfully.");
      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      console.error(
        "AuthContext: Logout error:",
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
      value={{ user, company, loading, login, logout, checkAuthStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
};
