/**
 * Model KhuyenMai (Promotion) - Khuyến mãi
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const KhuyenMai = sequelize.define('KhuyenMai', {
  MaKM: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'MaKM'
  },
  TenKM: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'TenKM'
  },
  MoTa: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'MoTa'
  },
  LoaiGiamGia: {
    type: DataTypes.ENUM('PhanTram', 'SoTien'),
    allowNull: false,
    field: 'LoaiGiamGia'
  },
  GiaTriGiam: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    validate: {
      min: 0
    },
    field: 'GiaTriGiam'
  },
  NgayBatDau: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'NgayBatDau'
  },
  NgayKetThuc: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'NgayKetThuc'
  },
  MaApDung: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    field: 'MaApDung'
  }
}, {
  tableName: 'KhuyenMai',
  timestamps: false
});

module.exports = KhuyenMai;

