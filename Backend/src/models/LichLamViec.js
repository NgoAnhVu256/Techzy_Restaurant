/**
 * Model LichLamViec (Work Schedule) - Lịch làm việc
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const LichLamViec = sequelize.define('LichLamViec', {
  MaLich: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'MaLich'
  },
  NgayLamViec: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'NgayLamViec'
  },
  MaNhanVien: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'NhanVien',
      key: 'MaNhanVien'
    },
    field: 'MaNhanVien'
  },
  MaCa: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'CaLamViec',
      key: 'MaCa'
    },
    field: 'MaCa'
  }
}, {
  tableName: 'LichLamViec',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['NgayLamViec', 'MaNhanVien', 'MaCa'],
      name: 'unique_schedule'
    }
  ]
});

module.exports = LichLamViec;

