/**
 * Model TaiKhoan (User/Account) - Tài khoản người dùng
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaiKhoan = sequelize.define('TaiKhoan', {
  MaTaiKhoan: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'MaTaiKhoan'
  },
  HoTen: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'HoTen'
  },
  TenDangNhap: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'TenDangNhap'
  },
  Email: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    },
    field: 'Email'
  },
  SDT: {
    type: DataTypes.STRING(15),
    allowNull: false,
    field: 'SDT'
  },
  MatKhauHash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'MatKhauHash'
  },
  MaVaiTro: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'VaiTro',
      key: 'MaVaiTro'
    },
    field: 'MaVaiTro'
  },
  TrangThai: {
    type: DataTypes.ENUM('Active', 'Inactive', 'Locked'),
    allowNull: false,
    defaultValue: 'Active',
    field: 'TrangThai'
  },
  NgayThamGia: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'NgayThamGia'
  },
  LastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'LastLogin'
  },
  LoginAttempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'LoginAttempts'
  },
  LockoutEnd: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'LockoutEnd'
  },
  MaNhanVien: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'MaNhanVien'
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
  tableName: 'TaiKhoan',
  timestamps: false,
  hooks: {
    beforeUpdate: (taiKhoan) => {
      taiKhoan.NgayCapNhat = new Date();
    }
  }
});

module.exports = TaiKhoan;

