/**
 * Model DatBanMonAn (Reservation Menu Item) - Món ăn trong đặt bàn
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DatBanMonAn = sequelize.define('DatBanMonAn', {
  Id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'Id'
  },
  MaDatBan: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'DatBan',
      key: 'MaDatBan'
    },
    field: 'MaDatBan'
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
  GhiChu: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'GhiChu'
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
  tableName: 'DatBanMonAn',
  timestamps: false,
  hooks: {
    beforeUpdate: (datBanMonAn) => {
      datBanMonAn.NgayCapNhat = new Date();
    }
  }
});

module.exports = DatBanMonAn;

