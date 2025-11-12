/**
 * Cấu hình kết nối PostgreSQL với Sequelize ORM
 * Hỗ trợ kết nối tới AWS RDS PostgreSQL
 */

const { Sequelize } = require("sequelize");
const config = require("./env");

// Tạo instance Sequelize
// Nếu có DATABASE_URL (thường từ AWS RDS), sử dụng nó
// Nếu không, sử dụng các biến môi trường riêng lẻ
let sequelize;

if (config.database.url) {
  // Kết nối qua connection string (AWS RDS thường dùng cách này)
  sequelize = new Sequelize(config.database.url, {
    dialect: "postgres",
    logging: config.database.logging,
    pool: config.database.pool,
    dialectOptions: {
      ssl:
        process.env.DB_SSL === "true"
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : false,
    },
  });
} else {
  // Kết nối qua các tham số riêng lẻ
  sequelize = new Sequelize(
    config.database.database,
    config.database.username,
    config.database.password,
    {
      host: config.database.host,
      port: config.database.port,
      dialect: config.database.dialect,
      logging: config.database.logging,
      pool: config.database.pool,
      dialectOptions: {
        ssl:
          process.env.DB_SSL === "true"
            ? {
                require: true,
                rejectUnauthorized: false,
              }
            : false,
      },
    }
  );
}

// Hàm kiểm tra kết nối database
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Kết nối database thành công!");
    return true;
  } catch (error) {
    console.error("❌ Không thể kết nối database:", error.message);
    return false;
  }
};

// Hàm đồng bộ database (sync models)
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log("✅ Đồng bộ database thành công!");
    return true;
  } catch (error) {
    console.error("❌ Lỗi đồng bộ database:", error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase,
};
