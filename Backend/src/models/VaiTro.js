/**
 * Model VaiTro (Role) - Vai trò người dùng
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const VaiTro = sequelize.define(
  "VaiTro",
  {
    MaVaiTro: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "MaVaiTro",
    },
    TenVaiTro: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "TenVaiTro",
    },
    MoTa: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: "",
      field: "MoTa",
    },
  },
  {
    tableName: "VaiTro",
    timestamps: false,
  }
);

module.exports = VaiTro;
