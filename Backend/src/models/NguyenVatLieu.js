/**
 * Model NguyenVatLieu (Raw Material) - Nguyên vật liệu
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const NguyenVatLieu = sequelize.define('NguyenVatLieu', {
  MaNguyenVatLieu: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'MaNguyenVatLieu'
  },
  TenNguyenVatLieu: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'TenNguyenVatLieu'
  },
  DonViTinh: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'DonViTinh'
  },
  SoLuongTon: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    },
    field: 'SoLuongTon'
  },
  MaNhaCungCap: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'NhaCungCap',
      key: 'MaNhaCungCap'
    },
    field: 'MaNhaCungCap'
  }
}, {
  tableName: 'NguyenVatLieu',
  timestamps: false
});

module.exports = NguyenVatLieu;

