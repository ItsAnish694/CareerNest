import axios from "axios";
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    if (response.data.message) {
      toast.success(response.data.message);
    }
    return response;
  },
  (error) => {
    const errorMessage =
      error.response?.data?.Error?.Message || "An unexpected error occurred.";
    toast.error(errorMessage);
    return Promise.reject(error);
  }
);

export default api;
