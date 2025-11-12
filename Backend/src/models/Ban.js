/**
 * Model Ban (Table) - Bàn ăn
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Ban = sequelize.define('Ban', {
  MaBan: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'MaBan'
  },
  TenBan: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'TenBan'
  },
  SucChua: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    },
    field: 'SucChua'
  },
  TrangThai: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'TrangThai'
  },
  SoLuongDatCho: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'SoLuongDatCho'
  }
}, {
  tableName: 'Ban',
  timestamps: false
});

module.exports = Ban;

