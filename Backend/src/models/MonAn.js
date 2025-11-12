/**
 * Model MonAn (Menu Item) - Món ăn
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MonAn = sequelize.define('MonAn', {
  MaMon: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'MaMon'
  },
  TenMon: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'TenMon'
  },
  Gia: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false,
    validate: {
      min: 0
    },
    field: 'Gia'
  },
  MaLoai: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'LoaiMon',
      key: 'MaLoai'
    },
    field: 'MaLoai'
  },
  HinhAnh: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'HinhAnh'
  },
  MaKM: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'MaKM'
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
  tableName: 'MonAn',
  timestamps: false,
  indexes: [
    {
      fields: ['TenMon']
    }
  ],
  hooks: {
    beforeUpdate: (monAn) => {
      monAn.NgayCapNhat = new Date();
    }
  }
});

module.exports = MonAn;

