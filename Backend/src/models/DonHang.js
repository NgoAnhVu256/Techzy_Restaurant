/**
 * Model DonHang (Order) - Đơn hàng
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DonHang = sequelize.define('DonHang', {
  MaDonHang: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'MaDonHang'
  },
  KhachHangID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'KhachHang',
      key: 'MaKhachHang'
    },
    field: 'KhachHangID'
  },
  NgayDat: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'NgayDat'
  },
  TrangThai: {
    type: DataTypes.ENUM('ChoXacNhan', 'DangChuanBi', 'HoanThanh', 'DaThanhToan', 'DaHuy'),
    allowNull: false,
    defaultValue: 'ChoXacNhan',
    field: 'TrangThai'
  },
  TongTien: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'TongTien'
  }
}, {
  tableName: 'DonHang',
  timestamps: false,
  indexes: [
    {
      fields: ['NgayDat']
    }
  ]
});

module.exports = DonHang;

