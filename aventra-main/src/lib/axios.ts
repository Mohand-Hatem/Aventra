

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  withCredentials: true, 
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    config.headers.set("Content-Type", "multipart/form-data");
  }
  return config;
});

export default axiosInstance;
