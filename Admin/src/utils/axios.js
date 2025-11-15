import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor: Tự động thêm JWT token vào header
api.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Nếu Content-Type là multipart/form-data (thường khi gửi file), axios sẽ tự động thiết lập
    if (config.headers["Content-Type"] === "multipart/form-data") {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Xử lý lỗi 401 (Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Chỉ redirect nếu không phải đang ở trang login
      if (window.location.pathname !== "/login") {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
