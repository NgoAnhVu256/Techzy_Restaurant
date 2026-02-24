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
const { SESClient, SendRawEmailCommand } = require("@aws-sdk/client-ses");
const { defaultProvider } = require("@aws-sdk/credential-providers");

// Tạo transporter (có thể cấu hình với SMTP hoặc dịch vụ email)
// Mặc định sử dụng Gmail SMTP, có thể thay đổi trong .env
const createTransporter = () => {
  // 1. Ưu tiên sử dụng AWS SES nếu có cấu hình region
  // (SDK v3 tự động nhận credentials từ env AWS_ACCESS_KEY_ID...)
  if (process.env.AWS_SES_REGION || (process.env.AWS_REGION && process.env.AWS_ACCESS_KEY_ID)) {
    const ses = new SESClient({
      region: process.env.AWS_SES_REGION || process.env.AWS_REGION || "ap-southeast-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    });

    return nodemailer.createTransport({
      SES: { ses, aws: { SendRawEmailCommand } }
    });
  }

  // 2. Nếu có cấu hình email trong .env (SMTP truyền thống)
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

/**
 * Gửi email xác nhận đơn hàng (UPDATED - Renamed)
 */
const sendOrderEmail = async (order, customer, chiTietDonHang) => {
  const itemsList = (chiTietDonHang || [])
    .map((item) => {
      const tenMon = item.monAn?.TenMon || item.TenMon || 'N/A';
      const soLuong = item.SoLuong || item.soLuong || 0;
      const donGia = Number(item.DonGia || item.donGia || 0);
      const thanhTien = Number(item.ThanhTien || item.thanhTien || 0);

      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${tenMon}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${soLuong}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${Math.round(donGia).toLocaleString('vi-VN')} VNĐ</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${Math.round(thanhTien).toLocaleString('vi-VN')} VNĐ</td>
        </tr>
      `;
    })
    .join('');

  const tongTien = Number(order.TongTien || 0);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Xác nhận đơn hàng</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #ff6b6b; text-align: center; margin-bottom: 30px;">🎉 Xác nhận đơn hàng thành công</h2>
          
          <p>Xin chào <strong>${customer.HoTen}</strong>,</p>
          <p>Cảm ơn bạn đã đặt hàng tại <strong>Techzy Restaurant</strong>! Đơn hàng của bạn đã được xác nhận.</p>
          
          <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1890ff;">📋 Thông tin đơn hàng</h3>
            <p><strong>Mã đơn hàng:</strong> #${order.MaDonHang}</p>
            <p><strong>Ngày đặt:</strong> ${new Date(order.NgayDat).toLocaleString('vi-VN')}</p>
            <p><strong>Loại đơn:</strong> ${order.LoaiDon === 'GiaoDi' ? '🚚 Giao hàng' : '🏠 Tại chỗ'}</p>
            ${order.DiaChiGiaoHang ? `<p><strong>Địa chỉ giao hàng:</strong> ${order.DiaChiGiaoHang}</p>` : ''}
          </div>

          <h3 style="color: #1890ff; margin-top: 30px;">🍽️ Chi tiết món ăn</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Món ăn</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">SL</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Đơn giá</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr style="background-color: #fff4e6;">
                <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px;">Tổng tiền:</td>
                <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #ff6b6b;">${Math.round(tongTien).toLocaleString('vi-VN')} VNĐ</td>
              </tr>
            </tfoot>
          </table>

          <div style="background-color: #fff9e6; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0;"><strong>⚠️ Lưu ý:</strong> ${order.LoaiDon === 'GiaoDi'
      ? 'Đơn hàng sẽ được giao trong vòng 30-45 phút. Vui lòng để ý điện thoại!'
      : 'Vui lòng đến nhà hàng đúng giờ để thưởng thức bữa ăn của bạn!'
    }</p>
          </div>

          <p style="text-align: center; margin-top: 30px; color: #666;">
            Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ:<br>
            📞 <strong>Hotline: 0373164472</strong><br>
            📧 <strong>Email: support@techzyrestaurant.com</strong>
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="text-align: center; color: #999; font-size: 12px;">
            © 2024 Techzy Restaurant. Cảm ơn quý khách!
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (customer.Email) {
    return await sendMail({
      to: customer.Email,
      subject: `Xác nhận đơn hàng #${order.MaDonHang} - Techzy Restaurant`,
      html
    });
  }

  return { success: false, message: 'Khách hàng không có email' };
};

/**
 * ✅ NEW: Gửi email hóa đơn thanh toán thành công
 */
const sendPaymentSuccessEmail = async (order, customer, chiTietDonHang) => {
  const itemsList = (chiTietDonHang || [])
    .map((item) => {
      const tenMon = item.monAn?.TenMon || item.TenMon || 'N/A';
      const soLuong = item.SoLuong || item.soLuong || 0;
      const donGia = Number(item.DonGia || item.donGia || 0);
      const thanhTien = Number(item.ThanhTien || item.thanhTien || 0);

      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${tenMon}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${soLuong}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${Math.round(donGia).toLocaleString('vi-VN')} VNĐ</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${Math.round(thanhTien).toLocaleString('vi-VN')} VNĐ</td>
        </tr>
      `;
    })
    .join('');

  const tongTien = Number(order.TongTien || 0);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Hóa đơn thanh toán</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #52c41a; text-align: center; margin-bottom: 30px;">Thanh toán thành công</h2>
          
          <p>Xin chào <strong>${customer.HoTen}</strong>,</p>
          <p>Cảm ơn bạn đã thanh toán! Đây là hóa đơn điện tử cho đơn hàng của bạn tại <strong>Techzy Restaurant</strong>.</p>
          
          <div style="background-color: #f6ffed; padding: 15px; border-radius: 5px; margin: 20px 0; border: 2px solid #52c41a;">
            <h3 style="margin-top: 0; color: #52c41a;">💳 Thông tin thanh toán</h3>
            <p><strong>Mã đơn hàng:</strong> #${order.MaDonHang}</p>
            <p><strong>Ngày thanh toán:</strong> ${new Date().toLocaleString('vi-VN')}</p>
            <p><strong>Phương thức:</strong> ${order.PaymentMethod === 'banking' ? 'Chuyển khoản' : 'Tiền mặt'}</p>
            <p><strong>Trạng thái:</strong> <span style="color: #52c41a; font-weight: bold;">Đã thanh toán</span></p>
          </div>

          <h3 style="color: #1890ff; margin-top: 30px;">Chi tiết hóa đơn</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Món ăn</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">SL</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Đơn giá</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList}
            </tbody>
            <tfoot>
              <tr style="background-color: #e6f7ff;">
                <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px;">Tổng tiền đã thanh toán:</td>
                <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #52c41a;">${Math.round(tongTien).toLocaleString('vi-VN')} VNĐ</td>
              </tr>
            </tfoot>
          </table>

          <div style="background-color: #e6f7ff; padding: 15px; border-left: 4px solid #1890ff; margin: 20px 0;">
            <p style="margin: 0;"><strong>Ghi chú:</strong> Hóa đơn này có giá trị như hóa đơn GTGT. Vui lòng giữ lại để đối chiếu nếu cần.</p>
          </div>

          <p style="text-align: center; margin-top: 30px; color: #666;">
            <strong>Cảm ơn quý khách đã tin tưởng sử dụng dịch vụ!</strong><br><br>
            Nếu có thắc mắc, vui lòng liên hệ:<br>
            <strong>Hotline: 0373164472</strong><br>
            <strong>Email: support@techzyrestaurant.com</strong>
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="text-align: center; color: #999; font-size: 12px;">
            © 2024 Techzy Restaurant. Rất hân hạnh được phục vụ quý khách!
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (customer.Email) {
    return await sendMail({
      to: customer.Email,
      subject: `Hóa đơn thanh toán #${order.MaDonHang} - Techzy Restaurant`,
      html
    });
  }

  return { success: false, message: 'Khách hàng không có email' };
};

/**
 * ✅ NEW: Gửi email xác nhận đặt bàn (với món ăn)
 */
const sendReservationEmail = async (reservation, customer) => {
  const monAnList = (reservation.datBanMonAn || [])
    .map((item) => {
      const tenMon = item.monAn?.TenMon || 'N/A';
      const soLuong = item.SoLuong || 0;
      const donGia = Number(item.DonGia || 0);
      const thanhTien = soLuong * donGia;

      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${tenMon}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${soLuong}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${Math.round(donGia).toLocaleString('vi-VN')} VNĐ</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">${Math.round(thanhTien).toLocaleString('vi-VN')} VNĐ</td>
        </tr>
      `;
    })
    .join('');

  const tongTien = (reservation.datBanMonAn || []).reduce((sum, item) => {
    return sum + (Number(item.SoLuong || 0) * Number(item.DonGia || 0));
  }, 0);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Xác nhận đặt bàn</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #ff6b6b; text-align: center; margin-bottom: 30px;">🎉 Xác nhận đặt bàn thành công</h2>
          
          <p>Xin chào <strong>${customer.HoTen}</strong>,</p>
          <p>Cảm ơn bạn đã đặt bàn tại <strong>Techzy Restaurant</strong>! Đặt bàn của bạn đã được xác nhận.</p>
          
          <div style="background-color: #fff9e6; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #ff9800;">🍽️ Thông tin đặt bàn</h3>
            <p><strong>Mã đặt bàn:</strong> #${reservation.MaDatBan}</p>
            <p><strong>Bàn:</strong> ${reservation.ban?.TenBan || 'N/A'} (Sức chứa: ${reservation.ban?.SucChua || 0} người)</p>
            <p><strong>Số người:</strong> ${reservation.SoNguoi}</p>
            <p><strong>Thời gian:</strong> ${new Date(reservation.ThoiGianBatDau).toLocaleString('vi-VN')}</p>
          </div>

          ${monAnList ? `
            <h3 style="color: #1890ff; margin-top: 30px;">🍽️ Món ăn đã đặt trước</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f5f5f5;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Món ăn</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">SL</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Đơn giá</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${monAnList}
              </tbody>
              <tfoot>
                <tr style="background-color: #fff4e6;">
                  <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px;">Tổng tiền dự kiến:</td>
                  <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 18px; color: #ff6b6b;">${Math.round(tongTien).toLocaleString('vi-VN')} VNĐ</td>
                </tr>
              </tfoot>
            </table>
          ` : ''}

          <div style="background-color: #fff9e6; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <p style="margin: 0;"><strong>⚠️ Lưu ý:</strong> Chúng tôi sẽ giữ bàn cho bạn trong 30 phút kể từ giờ đặt. Vui lòng đến đúng giờ!</p>
          </div>

          <p style="text-align: center; margin-top: 30px; color: #666;">
            Nếu cần hỗ trợ, vui lòng liên hệ:<br>
            📞 <strong>Hotline: 0373164472</strong><br>
            📧 <strong>Email: support@techzyrestaurant.com</strong>
          </p>

          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="text-align: center; color: #999; font-size: 12px;">
            © 2024 Techzy Restaurant. Rất hân hạnh được phục vụ quý khách!
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (customer.Email) {
    return await sendMail({
      to: customer.Email,
      subject: `Xác nhận đặt bàn #${reservation.MaDatBan} - Techzy Restaurant`,
      html
    });
  }

  return { success: false, message: 'Khách hàng không có email' };
};

module.exports = {
  sendMail,
  sendReservationConfirmation, // ✅ Giữ tương thích ngược
  sendOrderConfirmation, // ✅ Giữ tương thích ngược
  sendOrderEmail, // ✅ NEW: Tên mới cho rõ ràng
  sendPaymentSuccessEmail, // ✅ NEW: Email hóa đơn thanh toán
  sendReservationEmail, // ✅ NEW: Email đặt bàn với món ăn
};

