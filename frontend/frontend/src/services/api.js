import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://nexora-analytics-backend.onrender.com/api",
});

api.interceptors.request.use(
  (config) => {
    // Avoid sending Authorization header to public endpoints
    const isPublicEndpoint = 
      config.url.includes("/auth/login/") || 
      config.url.includes("/auth/register/") || 
      config.url.includes("/auth/token/refresh/");

    if (!isPublicEndpoint) {
      const token = localStorage.getItem("access");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login/")
    ) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api"}/auth/token/refresh/`,
            { refresh: refreshToken }
          );
          if (res.data.access) {
            localStorage.setItem("access", res.data.access);
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
