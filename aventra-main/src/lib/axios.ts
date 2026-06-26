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
  withCredentials: true, // عشان الـ cookies (accessToken/refreshToken) تتبعت تلقائياً
  headers: {
    "Content-Type": "application/json",
  },
});