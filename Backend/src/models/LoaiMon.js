/**
 * Model LoaiMon (Category) - Loại món ăn
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LoaiMon = sequelize.define('LoaiMon', {
  MaLoai: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'MaLoai'
  },
  TenLoai: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'TenLoai'
  },
  HinhAnh: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'HinhAnh'
  },
  NgayTao: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
    field: 'NgayTao'
  },
  NgayCapNhat: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'NgayCapNhat'
  },
  NguoiTao: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'NguoiTao'
  },
  NguoiCapNhat: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'NguoiCapNhat'
  }
}, {
  tableName: 'LoaiMon',
  timestamps: false,
  hooks: {
    beforeUpdate: (loaiMon) => {
      loaiMon.NgayCapNhat = new Date();
    }
  }
});

module.exports = LoaiMon;

