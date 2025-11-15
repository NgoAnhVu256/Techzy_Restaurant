/**
 * Controller xử lý API cho KhuyenMai (Promotions)
 */

const { KhuyenMai, MonAn } = require('../models');
const logger = require('../utils/logger');

// Lấy tất cả khuyến mãi
const getAllPromotions = async (req, res, next) => {
  try {
    const promotions = await KhuyenMai.findAll({
      include: [{
        model: MonAn,
        as: 'monAns'
      }],
      order: [['NgayBatDau', 'DESC']]
    });
    return res.json({ success: true, message: 'Lấy danh sách khuyến mãi thành công', data: promotions });
  } catch (error) {
    logger.error('Lỗi lấy danh sách khuyến mãi', { error: error.message });
    next(error);
  }
};

// Lấy khuyến mãi theo id
const getPromotionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const promotion = await KhuyenMai.findByPk(id, {
      include: [{
        model: MonAn,
        as: 'monAns'
      }]
    });
    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khuyến mãi' });
    }
    return res.json({ success: true, message: 'Lấy thông tin khuyến mãi thành công', data: promotion });
  } catch (error) {
    logger.error('Lỗi lấy khuyến mãi theo id', { error: error.message });
    next(error);
  }
};

// Tạo khuyến mãi
const createPromotion = async (req, res, next) => {
  try {
    const { TenKM, MoTa, LoaiGiamGia, GiaTriGiam, NgayBatDau, NgayKetThuc, MaApDung } = req.body;
    if (!TenKM || !LoaiGiamGia || !GiaTriGiam || !NgayBatDau || !NgayKetThuc) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin khuyến mãi' });
    }

    // Kiểm tra MaApDung trùng nếu có
    if (MaApDung) {
      const exists = await KhuyenMai.findOne({ where: { MaApDung } });
      if (exists) {
        return res.status(409).json({ success: false, message: 'Mã áp dụng đã tồn tại' });
      }
    }

    // Kiểm tra ngày hợp lệ
    const startDate = new Date(NgayBatDau);
    const endDate = new Date(NgayKetThuc);
    if (endDate < startDate) {
      return res.status(400).json({ success: false, message: 'Ngày kết thúc phải sau ngày bắt đầu' });
    }

    const created = await KhuyenMai.create({
      TenKM,
      MoTa: MoTa || null,
      LoaiGiamGia,
      GiaTriGiam: parseFloat(GiaTriGiam),
      NgayBatDau,
      NgayKetThuc,
      MaApDung: MaApDung || null
    });
    return res.status(201).json({ success: true, message: 'Tạo khuyến mãi thành công', data: created });
  } catch (error) {
    logger.error('Lỗi tạo khuyến mãi', { error: error.message });
    next(error);
  }
};

// Cập nhật khuyến mãi
const updatePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TenKM, MoTa, LoaiGiamGia, GiaTriGiam, NgayBatDau, NgayKetThuc, MaApDung } = req.body;
    
    const promotion = await KhuyenMai.findByPk(id);
    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khuyến mãi' });
    }

    if (TenKM) promotion.TenKM = TenKM;
    if (MoTa !== undefined) promotion.MoTa = MoTa || null;
    if (LoaiGiamGia) promotion.LoaiGiamGia = LoaiGiamGia;
    if (GiaTriGiam !== undefined) promotion.GiaTriGiam = parseFloat(GiaTriGiam);
    if (NgayBatDau) promotion.NgayBatDau = NgayBatDau;
    if (NgayKetThuc) promotion.NgayKetThuc = NgayKetThuc;
    if (MaApDung !== undefined && MaApDung !== promotion.MaApDung) {
      const exists = await KhuyenMai.findOne({ where: { MaApDung } });
      if (exists) {
        return res.status(409).json({ success: false, message: 'Mã áp dụng đã tồn tại' });
      }
      promotion.MaApDung = MaApDung || null;
    }

    // Kiểm tra ngày hợp lệ
    const startDate = new Date(promotion.NgayBatDau);
    const endDate = new Date(promotion.NgayKetThuc);
    if (endDate < startDate) {
      return res.status(400).json({ success: false, message: 'Ngày kết thúc phải sau ngày bắt đầu' });
    }

    await promotion.save();
    return res.json({ success: true, message: 'Cập nhật khuyến mãi thành công', data: promotion });
  } catch (error) {
    logger.error('Lỗi cập nhật khuyến mãi', { error: error.message });
    next(error);
  }
};

// Xóa khuyến mãi (chặn nếu còn món ăn)
const deletePromotion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const promotion = await KhuyenMai.findByPk(id);
    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khuyến mãi' });
    }

    const hasMenu = await MonAn.count({ where: { MaKM: id } });
    if (hasMenu > 0) {
      return res.status(400).json({ success: false, message: 'Không thể xóa vì còn món ăn đang áp dụng khuyến mãi này' });
    }

    await promotion.destroy();
    return res.json({ success: true, message: 'Xóa khuyến mãi thành công' });
  } catch (error) {
    logger.error('Lỗi xóa khuyến mãi', { error: error.message });
    next(error);
  }
};

module.exports = {
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion
};

