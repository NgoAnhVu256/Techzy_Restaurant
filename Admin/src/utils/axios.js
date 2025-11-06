import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: "http://localhost:5078/api", // Cập nhật URL đúng
  headers: {
    "Content-Type": "application/json", // Dùng application/json cho các yêu cầu thông thường
    Accept: "application/json", // Đảm bảo chấp nhận định dạng JSON từ server
  },
});

// Tạo interceptor để tự động thay đổi Content-Type khi cần thiết
api.interceptors.request.use(
  (config) => {
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

export default api;
