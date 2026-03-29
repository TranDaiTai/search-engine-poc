import axios from "axios";

const axiosClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config) => {
    // Trình duyệt tự động gửi cookie qua withCredentials: true
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Xử lý khi token hết hạn hoặc không hợp lệ
      console.warn("Session expired or unauthorized");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
