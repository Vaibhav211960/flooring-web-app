// ─────────────────────────────────────────────────────────────────────────────
// utils/api.js
// Shared axios instance for all customer pages.
// Interceptor always reads the freshest token on every request.
// ─────────────────────────────────────────────────────────────────────────────

import axios from "axios";
import { getUserToken } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = getUserToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;