/**
 * Utility logger - Ghi log cho ứng dụng
 * Hỗ trợ các mức log: error, warn, info, debug
 */

const fs = require("fs");
const path = require("path");

// Tạo thư mục logs nếu chưa tồn tại
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Format log message với timestamp
 */
const formatLog = (level, message, data = {}) => {
  const timestamp = new Date().toISOString();
  return {
    timestamp,
    level,
    message,
    ...data,
  };
};

/**
 * Ghi log vào file
 */
const writeLog = (level, message, data = {}) => {
  const logEntry = formatLog(level, message, data);
  const logString = JSON.stringify(logEntry) + "\n";
  const logFile = path.join(logsDir, `${level}.log`);

  fs.appendFile(logFile, logString, (err) => {
    if (err) {
      console.error("Lỗi ghi log:", err);
    }
  });
};

const logger = {
  /**
   * Log error
   */
  error: (message, data = {}) => {
    const logEntry = formatLog("ERROR", message, data);
    console.error(`[ERROR] ${logEntry.timestamp} - ${message}`, data);
    writeLog("error", message, data);
  },

  /**
   * Log warning
   */
  warn: (message, data = {}) => {
    const logEntry = formatLog("WARN", message, data);
    console.warn(`[WARN] ${logEntry.timestamp} - ${message}`, data);
    writeLog("warn", message, data);
  },

  /**
   * Log info
   */
  info: (message, data = {}) => {
    const logEntry = formatLog("INFO", message, data);
    console.info(`[INFO] ${logEntry.timestamp} - ${message}`, data);
    writeLog("info", message, data);
  },

  /**
   * Log debug
   */
  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === "development") {
      const logEntry = formatLog("DEBUG", message, data);
      console.debug(`[DEBUG] ${logEntry.timestamp} - ${message}`, data);
      writeLog("debug", message, data);
    }
  },
};

module.exports = logger;
