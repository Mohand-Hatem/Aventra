/**
 * Folder: src/lib
 * File: axios.ts
 * Purpose:
 * - Shared Axios HTTP client instance for all API requests.
 * - Contains base URL and token/interceptor setup.
 *
 * Example (when implementing later):
 * - export const apiClient = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_BASE_URL })
 */


import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
  error.response?.status === 401 &&
  !originalRequest._retry &&
  !originalRequest.url?.includes("/auth/refresh") &&
  !originalRequest.url?.includes("/auth/login")
) {
  originalRequest._retry = true;
  try {
    await apiClient.post("/auth/refresh");
    return apiClient(originalRequest);
  } catch {
    return Promise.reject(error);
  }
}

    return Promise.reject(error);
  }
);