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


// import axios from "axios";

// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
//   withCredentials: true,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config as typeof error.config & {
//       _retry?: boolean;
//     };

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
//       try {
//         await api.post("/auth/refresh");
//         return api(originalRequest);
//       } catch {
//         if (typeof window !== "undefined") {
//           window.location.href = "/login";
//         }
//       }
//     }

//     return Promise.reject(error);
//   },
// );

// export default api;


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