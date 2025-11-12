/**
 * File index để import tất cả models và thiết lập relationships
 */

const { sequelize } = require("../config/database");
const VaiTro = require("./VaiTro");
const TaiKhoan = require("./TaiKhoan");
const LoaiMon = require("./LoaiMon");
const MonAn = require("./MonAn");
const KhachHang = require("./KhachHang");
const Ban = require("./Ban");
const DonHang = require("./DonHang");
const ChiTietDonHang = require("./ChiTietDonHang");
const DatBan = require("./DatBan");
const DatBanMonAn = require("./DatBanMonAn");

// Định nghĩa relationships

// VaiTro - TaiKhoan (1-N)
VaiTro.hasMany(TaiKhoan, { foreignKey: "MaVaiTro", as: "taiKhoans" });
TaiKhoan.belongsTo(VaiTro, { foreignKey: "MaVaiTro", as: "vaiTro" });

// LoaiMon - MonAn (1-N)
LoaiMon.hasMany(MonAn, { foreignKey: "MaLoai", as: "monAns" });
MonAn.belongsTo(LoaiMon, { foreignKey: "MaLoai", as: "loaiMon" });

// KhachHang - DonHang (1-N)
KhachHang.hasMany(DonHang, { foreignKey: "KhachHangID", as: "donHangs" });
DonHang.belongsTo(KhachHang, { foreignKey: "KhachHangID", as: "khachHang" });

// DonHang - ChiTietDonHang (1-N)
DonHang.hasMany(ChiTietDonHang, {
  foreignKey: "MaDonHang",
  as: "chiTietDonHang",
});
ChiTietDonHang.belongsTo(DonHang, { foreignKey: "MaDonHang", as: "donHang" });

// MonAn - ChiTietDonHang (1-N)
MonAn.hasMany(ChiTietDonHang, { foreignKey: "MaMon", as: "chiTietDonHang" });
ChiTietDonHang.belongsTo(MonAn, { foreignKey: "MaMon", as: "monAn" });

// Ban - DatBan (1-N)
Ban.hasMany(DatBan, { foreignKey: "MaBan", as: "datBans" });
DatBan.belongsTo(Ban, { foreignKey: "MaBan", as: "ban" });

// KhachHang - DatBan (1-N)
KhachHang.hasMany(DatBan, { foreignKey: "MaKH", as: "datBans" });
DatBan.belongsTo(KhachHang, { foreignKey: "MaKH", as: "khachHang" });

// DatBan - DatBanMonAn (1-N)
DatBan.hasMany(DatBanMonAn, { foreignKey: "MaDatBan", as: "datBanMonAn" });
DatBanMonAn.belongsTo(DatBan, { foreignKey: "MaDatBan", as: "datBan" });

// MonAn - DatBanMonAn (1-N)
MonAn.hasMany(DatBanMonAn, { foreignKey: "MaMon", as: "datBanMonAn" });
DatBanMonAn.belongsTo(MonAn, { foreignKey: "MaMon", as: "monAn" });

module.exports = {
  sequelize,
  VaiTro,
  TaiKhoan,
  LoaiMon,
  MonAn,
  KhachHang,
  Ban,
  DonHang,
  ChiTietDonHang,
  DatBan,
  DatBanMonAn,
};
