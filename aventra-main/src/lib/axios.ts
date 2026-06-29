import axios, { AxiosError } from "axios";
import { logAuthError } from "@/lib/auth-debug";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

if (process.env.NODE_ENV === "development") {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const url = error.config?.url ?? "";
      if (url.startsWith("/auth/") || url.startsWith("/user/")) {
        logAuthError("axios", `${error.config?.method?.toUpperCase()} ${url} failed`, {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
      }
      return Promise.reject(error);
    }
  );
}

export default axiosInstance;
