/**
 * Model PhongBan (Department) - Phòng ban
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PhongBan = sequelize.define('PhongBan', {
  MaPhongBan: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'MaPhongBan'
  },
  TenPhongBan: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'TenPhongBan'
  }
}, {
  tableName: 'PhongBan',
  timestamps: false
});

module.exports = PhongBan;

