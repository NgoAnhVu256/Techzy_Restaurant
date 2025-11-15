/**
 * Controller xử lý API cho NguyenVatLieu (Storage/Materials)
 */

const { NguyenVatLieu, NhaCungCap } = require('../models');
const logger = require('../utils/logger');

// Lấy tất cả nguyên vật liệu
const getAllMaterials = async (req, res, next) => {
  try {
    const materials = await NguyenVatLieu.findAll({
      include: [{
        model: NhaCungCap,
        as: 'nhaCungCap'
      }],
      order: [['TenNguyenVatLieu', 'ASC']]
    });
    return res.json({ success: true, message: 'Lấy danh sách nguyên vật liệu thành công', data: materials });
  } catch (error) {
    logger.error('Lỗi lấy danh sách nguyên vật liệu', { error: error.message });
    next(error);
  }
};

// Lấy nguyên vật liệu theo id
const getMaterialById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = await NguyenVatLieu.findByPk(id, {
      include: [{
        model: NhaCungCap,
        as: 'nhaCungCap'
      }]
    });
    if (!material) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nguyên vật liệu' });
    }
    return res.json({ success: true, message: 'Lấy thông tin nguyên vật liệu thành công', data: material });
  } catch (error) {
    logger.error('Lỗi lấy nguyên vật liệu theo id', { error: error.message });
    next(error);
  }
};

// Tạo nguyên vật liệu
const createMaterial = async (req, res, next) => {
  try {
    const { TenNguyenVatLieu, DonViTinh, SoLuongTon, MaNhaCungCap } = req.body;
    if (!TenNguyenVatLieu || !DonViTinh) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập TenNguyenVatLieu và DonViTinh' });
    }

    // Kiểm tra nhà cung cấp tồn tại nếu có
    if (MaNhaCungCap) {
      const supplier = await NhaCungCap.findByPk(MaNhaCungCap);
      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy nhà cung cấp' });
      }
    }

    const created = await NguyenVatLieu.create({
      TenNguyenVatLieu,
      DonViTinh,
      SoLuongTon: SoLuongTon || 0,
      MaNhaCungCap: MaNhaCungCap || null
    });
    return res.status(201).json({ success: true, message: 'Tạo nguyên vật liệu thành công', data: created });
  } catch (error) {
    logger.error('Lỗi tạo nguyên vật liệu', { error: error.message });
    next(error);
  }
};

// Cập nhật nguyên vật liệu
const updateMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TenNguyenVatLieu, DonViTinh, SoLuongTon, MaNhaCungCap } = req.body;
    
    const material = await NguyenVatLieu.findByPk(id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nguyên vật liệu' });
    }

    if (TenNguyenVatLieu) material.TenNguyenVatLieu = TenNguyenVatLieu;
    if (DonViTinh) material.DonViTinh = DonViTinh;
    if (SoLuongTon !== undefined) material.SoLuongTon = parseFloat(SoLuongTon);
    if (MaNhaCungCap !== undefined) {
      if (MaNhaCungCap) {
        const supplier = await NhaCungCap.findByPk(MaNhaCungCap);
        if (!supplier) {
          return res.status(404).json({ success: false, message: 'Không tìm thấy nhà cung cấp' });
        }
      }
      material.MaNhaCungCap = MaNhaCungCap || null;
    }

    await material.save();
    return res.json({ success: true, message: 'Cập nhật nguyên vật liệu thành công', data: material });
  } catch (error) {
    logger.error('Lỗi cập nhật nguyên vật liệu', { error: error.message });
    next(error);
  }
};

// Xóa nguyên vật liệu
const deleteMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const material = await NguyenVatLieu.findByPk(id);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy nguyên vật liệu' });
    }

    await material.destroy();
    return res.json({ success: true, message: 'Xóa nguyên vật liệu thành công' });
  } catch (error) {
    logger.error('Lỗi xóa nguyên vật liệu', { error: error.message });
    next(error);
  }
};

module.exports = {
  getAllMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial
};

