/**
 * Controller xử lý API cho LoaiMon (Categories)
 */

const { LoaiMon, MonAn } = require('../models');
const logger = require('../utils/logger');

// Lấy tất cả loại món
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await LoaiMon.findAll({
      order: [['TenLoai', 'ASC']]
    });

    return res.json({ success: true, message: 'Lấy danh sách loại món thành công', data: categories });
  } catch (error) {
    logger.error('Lỗi lấy loại món', { error: error.message });
    next(error);
  }
};

// Lấy loại món theo id
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await LoaiMon.findByPk(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy loại món' });
    }
    return res.json({ success: true, message: 'Lấy loại món thành công', data: category });
  } catch (error) {
    logger.error('Lỗi lấy loại món theo id', { error: error.message });
    next(error);
  }
};

// Tạo loại món
const createCategory = async (req, res, next) => {
  try {
    const { TenLoai, HinhAnh } = req.body;
    if (!TenLoai || !HinhAnh) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập TenLoai và HinhAnh' });
    }

    const exists = await LoaiMon.findOne({ where: { TenLoai } });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Tên loại đã tồn tại' });
    }

    const created = await LoaiMon.create({ TenLoai, HinhAnh });
    return res.status(201).json({ success: true, message: 'Tạo loại món thành công', data: created });
  } catch (error) {
    logger.error('Lỗi tạo loại món', { error: error.message });
    next(error);
  }
};

// Cập nhật loại món
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TenLoai, HinhAnh } = req.body;
    const category = await LoaiMon.findByPk(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy loại món' });
    }

    if (TenLoai) category.TenLoai = TenLoai;
    if (HinhAnh) category.HinhAnh = HinhAnh;
    await category.save();

    return res.json({ success: true, message: 'Cập nhật loại món thành công', data: category });
  } catch (error) {
    logger.error('Lỗi cập nhật loại món', { error: error.message });
    next(error);
  }
};

// Xóa loại món (chặn nếu còn món ăn thuộc loại)
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const category = await LoaiMon.findByPk(id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy loại món' });
    }

    const hasMenu = await MonAn.count({ where: { MaLoai: id } });
    if (hasMenu > 0) {
      return res.status(400).json({ success: false, message: 'Không thể xóa vì còn món ăn thuộc loại này' });
    }

    await category.destroy();
    return res.json({ success: true, message: 'Xóa loại món thành công' });
  } catch (error) {
    logger.error('Lỗi xóa loại món', { error: error.message });
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
