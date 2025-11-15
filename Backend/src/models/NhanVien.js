/**
 * Model NhanVien (Employee) - Nhân viên
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NhanVien = sequelize.define('NhanVien', {
  MaNhanVien: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'MaNhanVien'
  },
  HoTen: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'HoTen'
  },
  NgaySinh: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'NgaySinh'
  },
  SDT: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: true,
    field: 'SDT'
  },
  ChucVu: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'ChucVu'
  },
  MaPhongBan: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'PhongBan',
      key: 'MaPhongBan'
    },
    field: 'MaPhongBan'
  }
}, {
  tableName: 'NhanVien',
  timestamps: false
});

module.exports = NhanVien;

