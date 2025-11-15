/**
 * Model NhaCungCap (Supplier) - Nhà cung cấp
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NhaCungCap = sequelize.define('NhaCungCap', {
  MaNhaCungCap: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'MaNhaCungCap'
  },
  TenNhaCungCap: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'TenNhaCungCap'
  },
  SoDienThoai: {
    type: DataTypes.STRING(15),
    allowNull: true,
    field: 'SoDienThoai'
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    },
    field: 'Email'
  },
  DiaChi: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'DiaChi'
  }
}, {
  tableName: 'NhaCungCap',
  timestamps: false
});

module.exports = NhaCungCap;

