import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
});

// =====================================================
// JWT TOKEN
// =====================================================

api.interceptors.request.use(
  (config) => {
    if (
      typeof window !==
      "undefined"
    ) {
      const token =
        localStorage.getItem(
          "token"
        );

      if (token) {
        config.headers =
          config.headers || {};

        config.headers.Authorization =
          `Bearer ${token}`;
      }
    }

    return config;
  },

  (error) => {
    return Promise.reject(
      error
    );
  }
);

// =====================================================
// RESPONSE ERROR
// =====================================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error.response?.status ===
      401
    ) {
      console.error(
        "AUTHENTICATION ERROR:",
        error.response?.data
      );
    }

    return Promise.reject(
      error
    );
  }
);

export default api;