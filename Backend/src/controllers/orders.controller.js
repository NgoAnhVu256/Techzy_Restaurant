/**
 * Controller xử lý API cho Orders (DonHang)
 * CRUD đơn hàng
 */

const { DonHang, ChiTietDonHang, MonAn, KhachHang } = require("../models");
const { sequelize } = require("../config/database");
const { Op } = require("sequelize");
const logger = require("../utils/logger");
const { sendOrderConfirmation } = require("../utils/sendMail");

/**
 * Lấy tất cả đơn hàng
 */
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await DonHang.findAll({
      include: [
        {
          model: KhachHang,
          as: "khachHang",
          attributes: ["MaKhachHang", "HoTen", "SoDienThoai", "Email"],
        },
        {
          model: ChiTietDonHang,
          as: "chiTietDonHang",
          include: [
            {
              model: MonAn,
              as: "monAn",
              attributes: ["MaMon", "TenMon", "HinhAnh"],
            },
          ],
        },
      ],
      order: [["NgayDat", "DESC"]],
    });

    return res.json({
      success: true,
      message: "Lấy danh sách đơn hàng thành công",
      data: orders,
    });
  } catch (error) {
    logger.error("Lỗi lấy danh sách đơn hàng", { error: error.message });
    next(error);
  }
};

/**
 * Lấy đơn hàng theo ID
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await DonHang.findByPk(id, {
      include: [
        {
          model: KhachHang,
          as: "khachHang",
        },
        {
          model: ChiTietDonHang,
          as: "chiTietDonHang",
          include: [
            {
              model: MonAn,
              as: "monAn",
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    return res.json({
      success: true,
      message: "Lấy thông tin đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    logger.error("Lỗi lấy đơn hàng", { error: error.message });
    next(error);
  }
};

/**
 * Tạo đơn hàng mới
 */
const createOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { MaKhachHang, ChiTietList } = req.body;

    // Validation
    if (
      !MaKhachHang ||
      !ChiTietList ||
      !Array.isArray(ChiTietList) ||
      ChiTietList.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp thông tin khách hàng và chi tiết đơn hàng",
      });
    }

    // Kiểm tra khách hàng tồn tại
    const khachHang = await KhachHang.findByPk(MaKhachHang);
    if (!khachHang) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy khách hàng",
      });
    }

    // Tạo đơn hàng
    const newOrder = await DonHang.create(
      {
        KhachHangID: MaKhachHang,
        NgayDat: new Date(),
        TrangThai: "ChoXacNhan",
        TongTien: 0,
      },
      { transaction }
    );

    // Tính tổng tiền và tạo chi tiết đơn hàng
    let tongTien = 0;
    const chiTietList = [];

    for (const item of ChiTietList) {
      const monAn = await MonAn.findByPk(item.MaMon, { transaction });

      if (!monAn) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy món ăn với mã ${item.MaMon}`,
        });
      }

      const donGia = parseFloat(monAn.Gia);
      const soLuong = parseInt(item.SoLuong);
      const thanhTien = donGia * soLuong;

      const chiTiet = await ChiTietDonHang.create(
        {
          MaDonHang: newOrder.MaDonHang,
          MaMon: item.MaMon,
          SoLuong: soLuong,
          DonGia: donGia,
          ThanhTien: thanhTien,
        },
        { transaction }
      );

      tongTien += thanhTien;
      chiTietList.push(chiTiet);
    }

    // Cập nhật tổng tiền
    newOrder.TongTien = tongTien;
    await newOrder.save({ transaction });

    await transaction.commit();

    // Lấy đơn hàng với thông tin đầy đủ
    const order = await DonHang.findByPk(newOrder.MaDonHang, {
      include: [
        {
          model: KhachHang,
          as: "khachHang",
        },
        {
          model: ChiTietDonHang,
          as: "chiTietDonHang",
          include: [
            {
              model: MonAn,
              as: "monAn",
            },
          ],
        },
      ],
    });

    // Gửi email xác nhận (không chặn response)
    sendOrderConfirmation(order, khachHang).catch((err) => {
      logger.error("Lỗi gửi email xác nhận đơn hàng", { error: err.message });
    });

    logger.info("Tạo đơn hàng thành công", { maDonHang: order.MaDonHang });

    return res.status(201).json({
      success: true,
      message: "Tạo đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    await transaction.rollback();
    logger.error("Lỗi tạo đơn hàng", { error: error.message });
    next(error);
  }
};

/**
 * Cập nhật trạng thái đơn hàng
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { TrangThai } = req.body;

    const validStatuses = [
      "ChoXacNhan",
      "DangChuanBi",
      "HoanThanh",
      "DaThanhToan",
      "DaHuy",
    ];

    if (!validStatuses.includes(TrangThai)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const order = await DonHang.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    order.TrangThai = TrangThai;
    await order.save();

    return res.json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    logger.error("Lỗi cập nhật trạng thái đơn hàng", { error: error.message });
    next(error);
  }
};

/**
 * Lấy số lượng đơn hàng hôm nay
 */
const getTodayOrderCount = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await DonHang.count({
      where: {
        NgayDat: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    });

    return res.json({
      success: true,
      message: "Lấy số lượng đơn hàng hôm nay thành công",
      data: { count },
    });
  } catch (error) {
    logger.error("Lỗi đếm đơn hàng hôm nay", { error: error.message });
    next(error);
  }
};

/**
 * Lấy doanh thu hôm nay
 */
const getTodayRevenue = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await DonHang.findAll({
      where: {
        NgayDat: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
        TrangThai: {
          [Op.ne]: "DaHuy",
        },
      },
      attributes: ["TongTien"],
    });

    const revenue = orders.reduce((sum, order) => {
      return sum + parseFloat(order.TongTien || 0);
    }, 0);

    return res.json({
      success: true,
      message: "Lấy doanh thu hôm nay thành công",
      data: { revenue },
    });
  } catch (error) {
    logger.error("Lỗi lấy doanh thu hôm nay", { error: error.message });
    next(error);
  }
};

/**
 * Xóa đơn hàng
 */
const deleteOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const order = await DonHang.findByPk(id, {
      include: [
        {
          model: ChiTietDonHang,
          as: "chiTietDonHang",
        },
      ],
      transaction,
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Xóa chi tiết đơn hàng
    await ChiTietDonHang.destroy({
      where: { MaDonHang: id },
      transaction,
    });

    // Xóa đơn hàng
    await order.destroy({ transaction });

    await transaction.commit();

    return res.json({
      success: true,
      message: "Xóa đơn hàng thành công",
    });
  } catch (error) {
    await transaction.rollback();
    logger.error("Lỗi xóa đơn hàng", { error: error.message });
    next(error);
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  getTodayOrderCount,
  getTodayRevenue,
  deleteOrder,
};
