/**
 * Controller xử lý API cho Reservations (DatBan)
 * CRUD đặt bàn
 */

const { DatBan, DatBanMonAn, Ban, KhachHang, MonAn } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { sendReservationConfirmation } = require('../utils/sendMail');

/**
 * Lấy tất cả đặt bàn
 */
const getAllReservations = async (req, res, next) => {
  try {
    const reservations = await DatBan.findAll({
      include: [
        {
          model: Ban,
          as: 'ban',
          attributes: ['MaBan', 'TenBan', 'SucChua']
        },
        {
          model: KhachHang,
          as: 'khachHang',
          attributes: ['MaKhachHang', 'HoTen', 'SoDienThoai', 'Email']
        },
        {
          model: DatBanMonAn,
          as: 'datBanMonAn',
          include: [{
            model: MonAn,
            as: 'monAn',
            attributes: ['MaMon', 'TenMon', 'Gia', 'HinhAnh']
          }]
        }
      ],
      order: [['NgayDat', 'DESC']]
    });

    return res.json({
      success: true,
      message: 'Lấy danh sách đặt bàn thành công',
      data: reservations
    });
  } catch (error) {
    logger.error('Lỗi lấy danh sách đặt bàn', { error: error.message });
    next(error);
  }
};

/**
 * Lấy đặt bàn theo ID
 */
const getReservationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const reservation = await DatBan.findByPk(id, {
      include: [
        {
          model: Ban,
          as: 'ban'
        },
        {
          model: KhachHang,
          as: 'khachHang'
        },
        {
          model: DatBanMonAn,
          as: 'datBanMonAn',
          include: [{
            model: MonAn,
            as: 'monAn'
          }]
        }
      ]
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đặt bàn'
      });
    }

    return res.json({
      success: true,
      message: 'Lấy thông tin đặt bàn thành công',
      data: reservation
    });
  } catch (error) {
    logger.error('Lỗi lấy đặt bàn', { error: error.message });
    next(error);
  }
};

/**
 * Tạo đặt bàn mới
 */
const createReservation = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { MaBan, MaKH, ThoiGianBatDau, ThoiGianKetThuc, SoNguoi, GhiChu, MonAn } = req.body;

    // Validation
    if (!MaBan || !MaKH || !ThoiGianBatDau || !ThoiGianKetThuc || !SoNguoi) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin'
      });
    }

    // Kiểm tra bàn tồn tại
    const ban = await Ban.findByPk(MaBan, { transaction });
    if (!ban) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bàn'
      });
    }

    // Kiểm tra khách hàng tồn tại
    const khachHang = await KhachHang.findByPk(MaKH, { transaction });
    if (!khachHang) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khách hàng'
      });
    }

    // Kiểm tra số người không vượt quá sức chứa
    if (SoNguoi > ban.SucChua) {
      return res.status(400).json({
        success: false,
        message: `Số người vượt quá sức chứa của bàn (tối đa ${ban.SucChua} người)`
      });
    }

    // Kiểm tra trùng lịch
    const thoiGianBatDau = new Date(ThoiGianBatDau);
    const thoiGianKetThuc = new Date(ThoiGianKetThuc);

    const coTrungLich = await DatBan.findOne({
      where: {
        MaBan: MaBan,
        ThoiGianBatDau: {
          [Op.lt]: thoiGianKetThuc
        },
        ThoiGianKetThuc: {
          [Op.gt]: thoiGianBatDau
        }
      },
      transaction
    });

    if (coTrungLich) {
      return res.status(409).json({
        success: false,
        message: 'Bàn đã được đặt trong thời gian này'
      });
    }

    // Tạo đặt bàn
    const newReservation = await DatBan.create({
      MaBan,
      MaKH,
      NgayDat: new Date(),
      ThoiGianBatDau: thoiGianBatDau,
      ThoiGianKetThuc: thoiGianKetThuc,
      SoNguoi: parseInt(SoNguoi),
      GhiChu: GhiChu || null
    }, { transaction });

    // Lưu thông tin món ăn nếu có
    if (MonAn && Array.isArray(MonAn) && MonAn.length > 0) {
      for (const monAnItem of MonAn) {
        const monAn = await MonAn.findByPk(monAnItem.MaMon, { transaction });
        
        if (!monAn) {
          await transaction.rollback();
          return res.status(404).json({
            success: false,
            message: `Không tìm thấy món ăn với mã ${monAnItem.MaMon}`
          });
        }

        await DatBanMonAn.create({
          MaDatBan: newReservation.MaDatBan,
          MaMon: monAnItem.MaMon,
          SoLuong: parseInt(monAnItem.SoLuong),
          DonGia: parseFloat(monAn.Gia),
          GhiChu: monAnItem.GhiChu || null
        }, { transaction });
      }
    }

    await transaction.commit();

    // Lấy đặt bàn với thông tin đầy đủ
    const reservation = await DatBan.findByPk(newReservation.MaDatBan, {
      include: [
        {
          model: Ban,
          as: 'ban'
        },
        {
          model: KhachHang,
          as: 'khachHang'
        },
        {
          model: DatBanMonAn,
          as: 'datBanMonAn',
          include: [{
            model: MonAn,
            as: 'monAn'
          }]
        }
      ]
    });

    // Gửi email xác nhận (không chặn response)
    sendReservationConfirmation(reservation, khachHang).catch(err => {
      logger.error('Lỗi gửi email xác nhận đặt bàn', { error: err.message });
    });

    logger.info('Tạo đặt bàn thành công', { maDatBan: reservation.MaDatBan });

    return res.status(201).json({
      success: true,
      message: 'Tạo đặt bàn thành công',
      data: reservation
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Lỗi tạo đặt bàn', { error: error.message });
    next(error);
  }
};

/**
 * Lấy món ăn theo đặt bàn
 */
const getMenuByReservation = async (req, res, next) => {
  try {
    const { maDatBan } = req.params;

    const menuItems = await DatBanMonAn.findAll({
      where: { MaDatBan: parseInt(maDatBan) },
      include: [{
        model: MonAn,
        as: 'monAn',
        attributes: ['MaMon', 'TenMon', 'Gia', 'HinhAnh']
      }]
    });

    if (!menuItems || menuItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy món ăn cho đặt bàn này'
      });
    }

    return res.json({
      success: true,
      message: 'Lấy danh sách món ăn thành công',
      data: menuItems
    });
  } catch (error) {
    logger.error('Lỗi lấy món ăn theo đặt bàn', { error: error.message });
    next(error);
  }
};

/**
 * Hủy đặt bàn
 */
const cancelReservation = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;

    const reservation = await DatBan.findByPk(id, {
      include: [{
        model: DatBanMonAn,
        as: 'datBanMonAn'
      }],
      transaction
    });

    if (!reservation) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đặt bàn'
      });
    }

    // Kiểm tra thời gian - không thể hủy đặt bàn đã bắt đầu
    if (new Date(reservation.ThoiGianBatDau) <= new Date()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đặt bàn đã bắt đầu'
      });
    }

    // Xóa các món ăn liên quan
    await DatBanMonAn.destroy({
      where: { MaDatBan: id },
      transaction
    });

    // Xóa đặt bàn
    await reservation.destroy({ transaction });

    await transaction.commit();

    logger.info('Hủy đặt bàn thành công', { maDatBan: id });

    return res.json({
      success: true,
      message: 'Hủy đặt bàn thành công'
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Lỗi hủy đặt bàn', { error: error.message });
    next(error);
  }
};

/**
 * Cập nhật đặt bàn
 */
const updateReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { ThoiGianBatDau, ThoiGianKetThuc, SoNguoi, GhiChu } = req.body;

    const reservation = await DatBan.findByPk(id, {
      include: [{
        model: Ban,
        as: 'ban'
      }]
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đặt bàn'
      });
    }

    // Cập nhật thông tin
    if (ThoiGianBatDau) reservation.ThoiGianBatDau = new Date(ThoiGianBatDau);
    if (ThoiGianKetThuc) reservation.ThoiGianKetThuc = new Date(ThoiGianKetThuc);
    if (SoNguoi) {
      if (SoNguoi > reservation.ban.SucChua) {
        return res.status(400).json({
          success: false,
          message: `Số người vượt quá sức chứa của bàn (tối đa ${reservation.ban.SucChua} người)`
        });
      }
      reservation.SoNguoi = parseInt(SoNguoi);
    }
    if (GhiChu !== undefined) reservation.GhiChu = GhiChu;

    await reservation.save();

    // Lấy đặt bàn với thông tin đầy đủ
    const updatedReservation = await DatBan.findByPk(id, {
      include: [
        {
          model: Ban,
          as: 'ban'
        },
        {
          model: KhachHang,
          as: 'khachHang'
        },
        {
          model: DatBanMonAn,
          as: 'datBanMonAn',
          include: [{
            model: MonAn,
            as: 'monAn'
          }]
        }
      ]
    });

    return res.json({
      success: true,
      message: 'Cập nhật đặt bàn thành công',
      data: updatedReservation
    });
  } catch (error) {
    logger.error('Lỗi cập nhật đặt bàn', { error: error.message });
    next(error);
  }
};

module.exports = {
  getAllReservations,
  getReservationById,
  createReservation,
  getMenuByReservation,
  cancelReservation,
  updateReservation
};

