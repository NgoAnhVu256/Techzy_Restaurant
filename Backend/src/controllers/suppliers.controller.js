/**
 * Controller xử lý API cho NhaCungCap (Suppliers)
 */

const { NhaCungCap, NguyenVatLieu } = require('../models');
const logger = require('../utils/logger');

// Lấy tất cả nhà cung cấp
const getAllSuppliers = async (req, res, next) => {
  try {
    const suppliers = await NhaCungCap.findAll({
      order: [['TenNhaCungCap', 'ASC']]
    });
    return res.json({ success: true, message: 'Lấy danh sách nhà cung cấp thành công', data: suppliers });
  } catch (error) {
    logger.error('Lỗi lấy danh sách nhà cung cấp', { error: error.message });
    next(error);
  }
};

// Lấy nhà cung cấp theo id
const getSupplierById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplier = await NhaCungCap.findByPk(id, {
      include: [{
        model: NguyenVatLieu,
        as: 'nguyenVatLieus'
      }]
    });
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhà cung cấp' });
    }
    return res.json({ success: true, message: 'Lấy thông tin nhà cung cấp thành công', data: supplier });
  } catch (error) {
    logger.error('Lỗi lấy nhà cung cấp theo id', { error: error.message });
    next(error);
  }
};

// Tạo nhà cung cấp
const createSupplier = async (req, res, next) => {
  try {
    const { TenNhaCungCap, SoDienThoai, Email, DiaChi } = req.body;
    if (!TenNhaCungCap) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập TenNhaCungCap' });
    }

    // Kiểm tra email trùng nếu có
    if (Email) {
      const exists = await NhaCungCap.findOne({ where: { Email } });
      if (exists) {
        return res.status(409).json({ success: false, message: 'Email đã tồn tại' });
      }
    }

    const created = await NhaCungCap.create({ TenNhaCungCap, SoDienThoai, Email, DiaChi });
    return res.status(201).json({ success: true, message: 'Tạo nhà cung cấp thành công', data: created });
  } catch (error) {
    logger.error('Lỗi tạo nhà cung cấp', { error: error.message });
    next(error);
  }
};

// Cập nhật nhà cung cấp
const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TenNhaCungCap, SoDienThoai, Email, DiaChi } = req.body;
    
    const supplier = await NhaCungCap.findByPk(id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhà cung cấp' });
    }

    if (TenNhaCungCap) supplier.TenNhaCungCap = TenNhaCungCap;
    if (SoDienThoai !== undefined) supplier.SoDienThoai = SoDienThoai;
    if (Email !== undefined) {
      // Kiểm tra email trùng nếu có
      if (Email && Email !== supplier.Email) {
        const exists = await NhaCungCap.findOne({ where: { Email } });
        if (exists) {
          return res.status(409).json({ success: false, message: 'Email đã tồn tại' });
        }
      }
      supplier.Email = Email;
    }
    if (DiaChi !== undefined) supplier.DiaChi = DiaChi;

    await supplier.save();
    return res.json({ success: true, message: 'Cập nhật nhà cung cấp thành công', data: supplier });
  } catch (error) {
    logger.error('Lỗi cập nhật nhà cung cấp', { error: error.message });
    next(error);
  }
};

// Xóa nhà cung cấp (chặn nếu còn nguyên vật liệu)
const deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplier = await NhaCungCap.findByPk(id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nhà cung cấp' });
    }

    const hasMaterials = await NguyenVatLieu.count({ where: { MaNhaCungCap: id } });
    if (hasMaterials > 0) {
      return res.status(400).json({ success: false, message: 'Không thể xóa vì còn nguyên vật liệu liên quan' });
    }

    await supplier.destroy();
    return res.json({ success: true, message: 'Xóa nhà cung cấp thành công' });
  } catch (error) {
    logger.error('Lỗi xóa nhà cung cấp', { error: error.message });
    next(error);
  }
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier
};

