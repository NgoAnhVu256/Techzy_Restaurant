/**
 * Controller xử lý API cho KhachHang (Customers)
 */

const { KhachHang, DonHang, DatBan } = require('../models');
const logger = require('../utils/logger');

// Danh sách khách hàng
const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await KhachHang.findAll({ order: [['HoTen', 'ASC']] });
    return res.json({ success: true, message: 'Lấy danh sách khách hàng thành công', data: customers });
  } catch (error) {
    logger.error('Lỗi lấy khách hàng', { error: error.message });
    next(error);
  }
};

// Lấy theo id
const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await KhachHang.findByPk(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    }
    return res.json({ success: true, message: 'Lấy thông tin khách hàng thành công', data: customer });
  } catch (error) {
    logger.error('Lỗi lấy khách hàng theo id', { error: error.message });
    next(error);
  }
};

// Tạo khách hàng (Upsert - tìm hoặc tạo mới)
const createCustomer = async (req, res, next) => {
  try {
    const { HoTen, SoDienThoai, Email, DiaChi } = req.body;
    if (!HoTen || !SoDienThoai) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập HoTen và SoDienThoai' });
    }

    // Tìm khách hàng theo số điện thoại
    let customer = await KhachHang.findOne({ where: { SoDienThoai } });

    if (customer) {
      // Cập nhật thông tin nếu có thay đổi
      if (HoTen) customer.HoTen = HoTen;
      if (Email) customer.Email = Email;
      if (DiaChi !== undefined) customer.DiaChi = DiaChi;
      await customer.save();
      return res.status(200).json({ success: true, message: 'Cập nhật thông tin khách hàng thành công', data: customer });
    } else {
      // Tạo mới khách hàng
      const created = await KhachHang.create({ HoTen, SoDienThoai, Email: Email || null, DiaChi: DiaChi || '' });
      return res.status(201).json({ success: true, message: 'Tạo khách hàng thành công', data: created });
    }
  } catch (error) {
    logger.error('Lỗi tạo khách hàng', { error: error.message });
    next(error);
  }
};

// Cập nhật khách hàng
const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { HoTen, SoDienThoai, Email, DiaChi } = req.body;
    const customer = await KhachHang.findByPk(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    }
    if (HoTen) customer.HoTen = HoTen;
    if (SoDienThoai) customer.SoDienThoai = SoDienThoai;
    if (Email !== undefined) customer.Email = Email;
    if (DiaChi !== undefined) customer.DiaChi = DiaChi;
    await customer.save();
    return res.json({ success: true, message: 'Cập nhật khách hàng thành công', data: customer });
  } catch (error) {
    logger.error('Lỗi cập nhật khách hàng', { error: error.message });
    next(error);
  }
};

// Xóa khách hàng (chặn nếu có đơn hàng/đặt bàn)
const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await KhachHang.findByPk(id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy khách hàng' });
    }
    const hasOrders = await DonHang.count({ where: { KhachHangID: id } });
    const hasReservations = await DatBan.count({ where: { MaKH: id } });
    if (hasOrders > 0 || hasReservations > 0) {
      return res.status(400).json({ success: false, message: 'Không thể xóa khách hàng vì đã phát sinh giao dịch' });
    }
    await customer.destroy();
    return res.json({ success: true, message: 'Xóa khách hàng thành công' });
  } catch (error) {
    logger.error('Lỗi xóa khách hàng', { error: error.message });
    next(error);
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
