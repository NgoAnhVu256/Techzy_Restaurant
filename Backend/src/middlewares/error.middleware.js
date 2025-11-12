/**
 * Middleware xử lý lỗi toàn cục
 * Bắt và xử lý tất cả các lỗi trong ứng dụng
 */

const logger = require("../utils/logger");

/**
 * Middleware xử lý lỗi
 */
const errorHandler = (err, req, res, next) => {
  // Log lỗi
  logger.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Lỗi từ Sequelize
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      success: false,
      message: "Dữ liệu đã tồn tại",
      field: err.errors[0]?.path,
    });
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(400).json({
      success: false,
      message: "Tham chiếu không hợp lệ",
      error: err.message,
    });
  }

  if (err.name === "SequelizeDatabaseError") {
    return res.status(500).json({
      success: false,
      message: "Lỗi database",
      error:
        process.env.NODE_ENV === "development" ? err.message : "Lỗi hệ thống",
    });
  }

  // Lỗi JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Token không hợp lệ",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token đã hết hạn",
    });
  }

  // Lỗi 404 - Not Found
  if (err.status === 404 || err.statusCode === 404) {
    return res.status(404).json({
      success: false,
      message: err.message || "Không tìm thấy tài nguyên",
    });
  }

  // Lỗi mặc định
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Lỗi server nội bộ";

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Middleware xử lý route không tồn tại (404)
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} không tồn tại`,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
