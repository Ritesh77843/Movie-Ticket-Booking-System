import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    apiClient.post("/api/auth/register", data),
  login: (data: { emailOrPhone: string; password: string }) =>
    apiClient.post("/api/auth/login", data),
  verifyOTP: (data: { email?: string; phone?: string; otp: string }) =>
    apiClient.post("/api/auth/verify", data),
  forgotPassword: (data: { email?: string; phone?: string }) =>
    apiClient.post("/api/auth/forgot-password", data),
  resetPassword: (data: {
    email?: string;
    phone?: string;
    otp: string;
    newPassword: string;
  }) => apiClient.post("/api/auth/reset-password", data),
  googleLogin: (data: { token: string }) =>
    apiClient.post("/api/auth/google", data),
};

// Shows API
export const showsAPI = {
  getAllShows: () => apiClient.get("/api/shows"),
  getShowById: (id: string) => apiClient.get(`/api/shows/${id}`),
  createShow: (data: any) => apiClient.post("/api/shows", data),
  lockSeats: (showId: string, seats: string[]) =>
    apiClient.post(`/api/shows/${showId}/lock`, { seats }),
  confirmBooking: (showId: string, seats: string[]) =>
    apiClient.post(`/api/shows/${showId}/confirm`, { seats }),
};

export default apiClient;
