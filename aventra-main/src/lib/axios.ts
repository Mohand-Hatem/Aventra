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

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  withCredentials: true, // ← allows cookies to be sent/received
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
