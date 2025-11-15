/**
 * Controller xử lý API cho CaLamViec (Shifts)
 */

const { CaLamViec, LichLamViec } = require('../models');
const logger = require('../utils/logger');

// Lấy tất cả ca làm việc
const getAllShifts = async (req, res, next) => {
  try {
    const shifts = await CaLamViec.findAll({
      order: [['GioBatDau', 'ASC']]
    });
    return res.json({ success: true, message: 'Lấy danh sách ca làm việc thành công', data: shifts });
  } catch (error) {
    logger.error('Lỗi lấy danh sách ca làm việc', { error: error.message });
    next(error);
  }
};

// Lấy ca làm việc theo id
const getShiftById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shift = await CaLamViec.findByPk(id);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ca làm việc' });
    }
    return res.json({ success: true, message: 'Lấy thông tin ca làm việc thành công', data: shift });
  } catch (error) {
    logger.error('Lỗi lấy ca làm việc theo id', { error: error.message });
    next(error);
  }
};

// Tạo ca làm việc
const createShift = async (req, res, next) => {
  try {
    const { TenCa, GioBatDau, GioKetThuc } = req.body;
    if (!TenCa || !GioBatDau || !GioKetThuc) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin ca làm việc' });
    }

    const created = await CaLamViec.create({ TenCa, GioBatDau, GioKetThuc });
    return res.status(201).json({ success: true, message: 'Tạo ca làm việc thành công', data: created });
  } catch (error) {
    logger.error('Lỗi tạo ca làm việc', { error: error.message });
    next(error);
  }
};

// Cập nhật ca làm việc
const updateShift = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TenCa, GioBatDau, GioKetThuc } = req.body;
    
    const shift = await CaLamViec.findByPk(id);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ca làm việc' });
    }

    if (TenCa) shift.TenCa = TenCa;
    if (GioBatDau) shift.GioBatDau = GioBatDau;
    if (GioKetThuc) shift.GioKetThuc = GioKetThuc;

    await shift.save();
    return res.json({ success: true, message: 'Cập nhật ca làm việc thành công', data: shift });
  } catch (error) {
    logger.error('Lỗi cập nhật ca làm việc', { error: error.message });
    next(error);
  }
};

// Xóa ca làm việc (chặn nếu còn lịch làm việc)
const deleteShift = async (req, res, next) => {
  try {
    const { id } = req.params;
    const shift = await CaLamViec.findByPk(id);
    if (!shift) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy ca làm việc' });
    }

    const hasSchedules = await LichLamViec.count({ where: { MaCa: id } });
    if (hasSchedules > 0) {
      return res.status(400).json({ success: false, message: 'Không thể xóa vì còn lịch làm việc liên quan' });
    }

    await shift.destroy();
    return res.json({ success: true, message: 'Xóa ca làm việc thành công' });
  } catch (error) {
    logger.error('Lỗi xóa ca làm việc', { error: error.message });
    next(error);
  }
};

module.exports = {
  getAllShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift
};

