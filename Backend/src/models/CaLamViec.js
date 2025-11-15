/**
 * Model CaLamViec (Shift) - Ca làm việc
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CaLamViec = sequelize.define('CaLamViec', {
  MaCa: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'MaCa'
  },
  TenCa: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'TenCa'
  },
  GioBatDau: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'GioBatDau'
  },
  GioKetThuc: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'GioKetThuc'
  }
}, {
  tableName: 'CaLamViec',
  timestamps: false
});

module.exports = CaLamViec;

