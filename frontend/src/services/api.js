import axios from "axios";
import routeMap from "./routeMap";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

/**
 * Token helpers:
 * - access token stored in localStorage.token (access)
 * - refresh token stored in localStorage.refreshToken (refresh)
 *
 * Request interceptor attaches access token.
 * Response interceptor attempts refresh on 401 and retries original request once.
 */

api.interceptors.request.use(
  (cfg) => {
    const token = localStorage.getItem("token");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
  },
  (err) => Promise.reject(err)
);

let isRefreshing = false;
let refreshQueue = [];

/** helper to process queued requests after refresh */
const processQueue = (error, token = null) => {
  refreshQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  refreshQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // If unauthorized and not already retried
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      // Avoid infinite loop
      if (isRefreshing) {
        // queue
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");

        // Call refresh endpoint
        const resp = await axios.post(
          routeMap.auth.refreshToken ||
            `${API_BASE}/api/v1/users/auth/refreshAccessToken`,
          {},
          { withCredentials: true }
        );
        const newAccessToken =
          resp.data?.data?.accessToken || resp.data?.accessToken;

        if (newAccessToken) {
          localStorage.setItem("token", newAccessToken);
          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          isRefreshing = false;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error("Refresh failed: no token returned");
        }
      } catch (err) {
        processQueue(err, null);
        isRefreshing = false;
        // logout client side
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/auth/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
