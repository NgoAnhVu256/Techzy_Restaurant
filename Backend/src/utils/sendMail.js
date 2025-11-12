/**
 * Utility gửi email
 * Sử dụng nodemailer để gửi email
 * Có thể cấu hình với SMTP hoặc các dịch vụ email khác
 */

const nodemailer = require('nodemailer');
const config = require('../config/env');
const logger = require('./logger');

// Tạo transporter (có thể cấu hình với SMTP hoặc dịch vụ email)
// Mặc định sử dụng Gmail SMTP, có thể thay đổi trong .env
const createTransporter = () => {
  // Nếu có cấu hình email trong .env
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // Nếu không có cấu hình, trả về null (không gửi email)
  logger.warn('Email không được cấu hình. Email sẽ không được gửi.');
  return null;
};

const transporter = createTransporter();

/**
 * Gửi email
 * @param {Object} options - Thông tin email
 * @param {string} options.to - Email người nhận
 * @param {string} options.subject - Tiêu đề email
 * @param {string} options.html - Nội dung HTML
 * @param {string} options.text - Nội dung text (optional)
 */
const sendMail = async ({ to, subject, html, text }) => {
  try {
    if (!transporter) {
      logger.warn('Email transporter chưa được cấu hình. Bỏ qua gửi email.');
      return { success: false, message: 'Email chưa được cấu hình' };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@restaurant.com',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Convert HTML to text nếu không có text
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email đã được gửi thành công', { to, subject, messageId: info.messageId });
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    logger.error('Lỗi gửi email', { error: error.message, to, subject });
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Gửi email xác nhận đặt bàn
 */
const sendReservationConfirmation = async (reservation, customer) => {
  const html = `
    <h2>Xác nhận đặt bàn thành công</h2>
    <p>Xin chào ${customer.HoTen},</p>
    <p>Đặt bàn của bạn đã được xác nhận:</p>
    <ul>
      <li><strong>Mã đặt bàn:</strong> ${reservation.MaDatBan}</li>
      <li><strong>Bàn:</strong> ${reservation.ban?.TenBan || 'N/A'}</li>
      <li><strong>Số người:</strong> ${reservation.SoNguoi}</li>
      <li><strong>Thời gian:</strong> ${new Date(reservation.ThoiGianBatDau).toLocaleString('vi-VN')}</li>
    </ul>
    <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
  `;

  if (customer.Email) {
    return await sendMail({
      to: customer.Email,
      subject: 'Xác nhận đặt bàn - Techzy Restaurant',
      html
    });
  }

  return { success: false, message: 'Khách hàng không có email' };
};

/**
 * Gửi email xác nhận đơn hàng
 */
const sendOrderConfirmation = async (order, customer) => {
  const html = `
    <h2>Xác nhận đơn hàng thành công</h2>
    <p>Xin chào ${customer.HoTen},</p>
    <p>Đơn hàng của bạn đã được xác nhận:</p>
    <ul>
      <li><strong>Mã đơn hàng:</strong> ${order.MaDonHang}</li>
      <li><strong>Ngày đặt:</strong> ${new Date(order.NgayDat).toLocaleString('vi-VN')}</li>
      <li><strong>Tổng tiền:</strong> ${order.TongTien.toLocaleString('vi-VN')} VNĐ</li>
      <li><strong>Trạng thái:</strong> ${order.TrangThai}</li>
    </ul>
    <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
  `;

  if (customer.Email) {
    return await sendMail({
      to: customer.Email,
      subject: 'Xác nhận đơn hàng - Techzy Restaurant',
      html
    });
  }

  return { success: false, message: 'Khách hàng không có email' };
};

module.exports = {
  sendMail,
  sendReservationConfirmation,
  sendOrderConfirmation
};

