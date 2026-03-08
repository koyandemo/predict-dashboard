import axios from "axios";

const apiConfig = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

apiConfig.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("authToken");
    config.headers.Authorization = `Bearer ${token || ""}`;
    return config;
  },
  (error) => {
    console.log("Request Error:", error);
    return Promise.reject(error);
  }
);

apiConfig.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    if (status === 401) {
      window.location.assign("/login");
    } else if (status === 404) {
      // Handle not found errors
    } else {
      // Handle other errors
    }

    return Promise.reject(error);
  }
);

export { apiConfig };
