import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Reservation.css";

const ReservationConfirm = ({ show, onClose, reservationDetails }) => {
  if (!show) return null;
  return (
    <div
      className="reservation-popup-backdrop"
      onClick={(e) => {
        if (e.target.className === "reservation-popup-backdrop") onClose();
      }}
    >
      <div className="reservation-popup-container">
        <button className="reservation-popup-close" onClick={onClose}>
          ×
        </button>
        <div className="reservation-popup-content">
          <h2>Đã nhận đặt bàn</h2>
          <p>
            Chúng tôi đã nhận thông tin đặt bàn của bạn.
            <br />
            Mã đặt bàn của bạn là:{" "}
            <strong>{reservationDetails?.maDatBan}</strong>
            <br />
            Chúng tôi đã gửi email xác nhận đến địa chỉ:{" "}
            {reservationDetails?.email}
            <br />
            Vui lòng kiểm tra email để xác nhận đặt bàn.
          </p>
          <button
            className="reservation-popup-confirm-button"
            onClick={onClose}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const Reservation = () => {
  const [tables, setTables] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    day: "",
    hourStart: "",
    hourEnd: "",
    people: 1,
    tableId: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [reservationDetails, setReservationDetails] = useState(null);

  // Fetch tables
  useEffect(() => {
    const fetchTables = async () => {
      setLoadingTables(true);
      try {
        const response = await axios.get("http://localhost:5078/api/Ban");
        if (response.data.length === 0) {
          setError("Hiện tại không có bàn nào trong hệ thống");
          return;
        }
        setTables(response.data);
        setError("");
      } catch (err) {
        console.error(
          "Lỗi khi tải danh sách bàn:",
          err.response?.data || err.message
        );
        setError("Không thể tải danh sách bàn. Vui lòng thử lại sau.");
        setTables([]);
      } finally {
        setLoadingTables(false);
      }
    };
    fetchTables();
  }, []);

  // Fetch available tables
  useEffect(() => {
    const fetchAvailableTables = async () => {
      if (!form.day || !form.hourStart || !form.hourEnd || !form.people) {
        setAvailableTables([]);
        return;
      }

      setLoadingTables(true);
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const reservationDate = new Date(form.day);
        reservationDate.setHours(0, 0, 0, 0);

        if (reservationDate < today) {
          setError("Ngày đặt bàn không thể là ngày trong quá khứ");
          setAvailableTables([]);
          return;
        }

        const startDateTime = new Date(`${form.day}T${form.hourStart}:00`);
        const endDateTime = new Date(`${form.day}T${form.hourEnd}:00`);

        const timeDiff = (endDateTime - startDateTime) / (1000 * 60);
        if (timeDiff < 30 || timeDiff > 240) {
          setError("Thời gian đặt bàn phải từ 30 phút đến 4 giờ");
          setAvailableTables([]);
          return;
        }

        const response = await axios.get(
          `http://localhost:5078/api/Ban/available?date=${form.day}&startTime=${form.hourStart}&endTime=${form.hourEnd}&people=${form.people}`
        );
        setAvailableTables(response.data);
        setError("");
      } catch (err) {
        setError("Không thể kiểm tra bàn trống. Vui lòng thử lại sau.");
        console.error("Error fetching available tables:", err);
      } finally {
        setLoadingTables(false);
      }
    };

    fetchAvailableTables();
  }, [form.day, form.hourStart, form.hourEnd, form.people]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Tạo khách hàng trước
      const khachHangResponse = await axios.post("http://localhost:5078/api/KhachHang", {
        hoTen: form.name,
        soDienThoai: form.phone,
        email: form.email,
        diaChi: form.address
      });

      if (!khachHangResponse.data?.maKhachHang) {
        throw new Error("Không thể tạo thông tin khách hàng");
      }

      // Đặt bàn với mã khách hàng vừa tạo
      const response = await axios.post("http://localhost:5078/api/DatBan", {
        maBan: parseInt(form.tableId),
        maKH: khachHangResponse.data.maKhachHang,
        thoiGianBatDau: new Date(`${form.day}T${form.hourStart}:00`).toISOString(),
        thoiGianKetThuc: new Date(`${form.day}T${form.hourEnd}:00`).toISOString(),
        soNguoi: parseInt(form.people),
        ghiChu: ""
      });

      if (response.data) {
        setReservationDetails(response.data);
        setShowConfirm(true);
        setForm({
          name: "",
          phone: "",
          email: "",
          address: "",
          day: "",
          hourStart: "",
          hourEnd: "",
          people: 1,
          tableId: "",
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data || err.message || "Có lỗi xảy ra khi đặt bàn. Vui lòng thử lại sau.";
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reservation-container">
      <h2>Đặt bàn</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="reservation-form">
        <div className="form-group">
          <label>
            Họ và tên
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Số điện thoại
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Địa chỉ
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Ngày đặt
            <input
              type="date"
              name="day"
              value={form.day}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Giờ bắt đầu
            <input
              type="time"
              name="hourStart"
              value={form.hourStart}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Giờ kết thúc
            <input
              type="time"
              name="hourEnd"
              value={form.hourEnd}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Số người
            <input
              type="number"
              name="people"
              value={form.people}
              onChange={handleChange}
              min="1"
              required
            />
          </label>
        </div>

        <div className="form-group">
          <label>
            Chọn bàn
            {loadingTables ? (
              <div className="loading-message">Đang tải danh sách bàn...</div>
            ) : availableTables.length > 0 ? (
              <select
                name="tableId"
                value={form.tableId}
                onChange={handleChange}
                required
              >
                <option value="">Chọn bàn</option>
                {availableTables.map((table) => (
                  <option key={table.maBan} value={table.maBan}>
                    {table.tenBan} - Sức chứa: {table.sucChua} người
                  </option>
                ))}
              </select>
            ) : (
              <div className="warning-message">
                {form.day && form.hourStart && form.hourEnd && form.people
                  ? "Không có bàn phù hợp trong thời gian này"
                  : "Vui lòng chọn thời gian và số người để xem bàn trống"}
              </div>
            )}
          </label>
        </div>

        <button
          type="submit"
          className="reservation-submit-btn"
          disabled={loading || loadingTables}
        >
          {loading ? "Đang xử lý..." : "Đặt bàn"}
        </button>
      </form>
      <ReservationConfirm
        show={showConfirm}
        onClose={() => setShowConfirm(false)}
        reservationDetails={reservationDetails}
      />
    </div>
  );
};

export default Reservation;
