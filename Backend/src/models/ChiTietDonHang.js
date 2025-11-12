/**
 * Model ChiTietDonHang (Order Detail) - Chi tiết đơn hàng
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChiTietDonHang = sequelize.define('ChiTietDonHang', {
  MaChiTiet: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'MaChiTiet'
  },
  MaDonHang: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'DonHang',
      key: 'MaDonHang'
    },
    field: 'MaDonHang'
  },
  MaMon: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'MonAn',
      key: 'MaMon'
    },
    field: 'MaMon'
  },
  SoLuong: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    },
    field: 'SoLuong'
  },
  DonGia: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    field: 'DonGia'
  },
  ThanhTien: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    field: 'ThanhTien'
  }
}, {
  tableName: 'ChiTietDonHang',
  timestamps: false
});

module.exports = ChiTietDonHang;

