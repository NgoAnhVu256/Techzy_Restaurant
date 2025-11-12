/**
 * Model KhachHang (Customer) - Khách hàng
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const KhachHang = sequelize.define('KhachHang', {
  MaKhachHang: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'MaKhachHang'
  },
  HoTen: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'HoTen'
  },
  SoDienThoai: {
    type: DataTypes.STRING(15),
    allowNull: false,
    field: 'SoDienThoai'
  },
  Email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    },
    field: 'Email'
  },
  DiaChi: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: '',
    field: 'DiaChi'
  }
}, {
  tableName: 'KhachHang',
  timestamps: false
});

module.exports = KhachHang;

