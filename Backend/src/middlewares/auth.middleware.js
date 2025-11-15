/**
 * Middleware xác thực JWT
 * Kiểm tra token và gán thông tin user vào request
 */

const jwt = require("jsonwebtoken");
const config = require("../config/env");
const { TaiKhoan, VaiTro } = require("../models");

/**
 * Middleware xác thực JWT token
 */
const authenticate = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Không có token xác thực",
      });
    }

    const token = authHeader.substring(7); // Bỏ "Bearer " prefix

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Lấy thông tin user từ database
    const taiKhoan = await TaiKhoan.findByPk(decoded.id, {
      include: [
        {
          model: VaiTro,
          as: "vaiTro",
        },
      ],
    });

    if (!taiKhoan) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    // Kiểm tra trạng thái tài khoản
    if (taiKhoan.TrangThai === "Locked") {
      if (taiKhoan.LockoutEnd && new Date(taiKhoan.LockoutEnd) > new Date()) {
        return res.status(403).json({
          success: false,
          message: "Tài khoản đã bị khóa",
        });
      }
    }

    if (taiKhoan.TrangThai !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Tài khoản đã bị vô hiệu hóa",
      });
    }

    // Gán thông tin user vào request
    req.user = {
      id: taiKhoan.MaTaiKhoan,
      tenDangNhap: taiKhoan.TenDangNhap,
      email: taiKhoan.Email,
      hoTen: taiKhoan.HoTen,
      role: taiKhoan.vaiTro?.TenVaiTro || "NhanVien",
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Lỗi xác thực",
      error: error.message,
    });
  }
};

/**
 * Middleware kiểm tra quyền Admin
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Chưa xác thực",
    });
  }

  if (req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Không có quyền truy cập",
    });
  }

  next();
};

/**
 * Middleware kiểm tra quyền Admin hoặc Nhân viên
 */
const isEmployeeOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Chưa xác thực",
    });
  }

  if (req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Không có quyền truy cập",
    });
  }

  next();
};

module.exports = {
  authenticate,
  isAdmin,
  isEmployeeOrAdmin,
};
