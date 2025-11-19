import React, { useState } from "react";
import { toast } from "react-toastify";
import api from "../../utils/axios";
import "./ReservationPage.css";

const ReservationPage = () => {
  const [formData, setFormData] = useState({
    HoTen: "",
    SoDienThoai: "",
    Email: "",
    ThoiGianBatDau: "",
    SoNguoi: 1,
    GhiChu: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Tạo hoặc tìm khách hàng (upsert)
      const customerResponse = await api.post("/customers", {
        HoTen: formData.HoTen,
        SoDienThoai: formData.SoDienThoai,
        Email: formData.Email,
      });

      const customer = customerResponse.data.data;

      // Tính thời gian kết thúc (mặc định 2 giờ)
      const startTime = new Date(formData.ThoiGianBatDau);
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

      // Tạo đặt bàn
      // Lưu ý: Cần có MaBan, có thể lấy bàn trống hoặc để user chọn
      // Tạm thời dùng MaBan = 1 (cần cập nhật logic chọn bàn)
      const reservationData = {
        MaBan: 1, // TODO: Implement table selection
        MaKH: customer.MaKhachHang || customer.maKhachHang,
        ThoiGianBatDau: formData.ThoiGianBatDau,
        ThoiGianKetThuc: endTime.toISOString(),
        SoNguoi: parseInt(formData.SoNguoi),
        GhiChu: formData.GhiChu || null,
      };

      await api.post("/reservations", reservationData);

      toast.success("Đặt bàn thành công! Chúng tôi sẽ liên hệ lại.");
      setFormData({
        HoTen: "",
        SoDienThoai: "",
        Email: "",
        ThoiGianBatDau: "",
        SoNguoi: 1,
        GhiChu: "",
      });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reservation-page">
      <div className="reservation-container">
        <h1>Đặt bàn</h1>
        <p className="subtitle">Vui lòng điền thông tin để đặt bàn</p>

        <form onSubmit={handleSubmit} className="reservation-form">
          <div className="form-group">
            <label htmlFor="HoTen">Họ và tên *</label>
            <input
              type="text"
              id="HoTen"
              name="HoTen"
              value={formData.HoTen}
              onChange={handleChange}
              required
              placeholder="Nhập họ và tên"
            />
          </div>

          <div className="form-group">
            <label htmlFor="SoDienThoai">Số điện thoại *</label>
            <input
              type="tel"
              id="SoDienThoai"
              name="SoDienThoai"
              value={formData.SoDienThoai}
              onChange={handleChange}
              required
              placeholder="Nhập số điện thoại"
            />
          </div>

          <div className="form-group">
            <label htmlFor="Email">Email *</label>
            <input
              type="email"
              id="Email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              required
              placeholder="Nhập email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="ThoiGianBatDau">Thời gian bắt đầu *</label>
            <input
              type="datetime-local"
              id="ThoiGianBatDau"
              name="ThoiGianBatDau"
              value={formData.ThoiGianBatDau}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="SoNguoi">Số người *</label>
            <input
              type="number"
              id="SoNguoi"
              name="SoNguoi"
              value={formData.SoNguoi}
              onChange={handleChange}
              required
              min="1"
              max="20"
            />
          </div>

          <div className="form-group">
            <label htmlFor="GhiChu">Ghi chú</label>
            <textarea
              id="GhiChu"
              name="GhiChu"
              value={formData.GhiChu}
              onChange={handleChange}
              rows="4"
              placeholder="Ghi chú thêm (nếu có)"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Đang xử lý..." : "Gửi đặt bàn"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReservationPage;

