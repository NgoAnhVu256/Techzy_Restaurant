import React, { useState, useEffect } from "react";
import "./Cart.css";
import axios from "axios";

const Cart = () => {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get("http://localhost:5078/api/DatBan");
        setReservations(response.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin đặt bàn:", error);
      }
    };

    fetchReservations();
  }, []);

  return (
    <div className="cart">
      <div className="cart-items-container">
        <div className="cart-items-header">
          <h2>Thông tin bàn đã đặt</h2>
        </div>
        {reservations.length === 0 ? (
          <p className="empty-message">Bạn chưa có bàn nào được đặt</p>
        ) : (
          <div className="reservation-list">
            {reservations.map((reservation) => (
              <div key={reservation.maDatBan} className="reservation-item">
                <div className="reservation-details">
                  <h3>Thông tin đặt bàn #{reservation.maDatBan}</h3>
                  <p>
                    <strong>Họ tên:</strong> {reservation.hoTen}
                  </p>
                  <p>
                    <strong>Số điện thoại:</strong> {reservation.soDienThoai}
                  </p>
                  <p>
                    <strong>Địa chỉ:</strong> {reservation.diaChi}
                  </p>
                  <p>
                    <strong>Ngày đặt:</strong>{" "}
                    {new Date(reservation.ngayDat).toLocaleDateString("vi-VN")}
                  </p>
                  <p>
                    <strong>Giờ bắt đầu:</strong> {reservation.gioBatDau}
                  </p>
                  <p>
                    <strong>Giờ kết thúc:</strong> {reservation.gioKetThuc}
                  </p>
                  <p>
                    <strong>Số người:</strong> {reservation.soNguoi}
                  </p>
                  <p>
                    <strong>Tiền cọc:</strong>{" "}
                    {reservation.tienCoc.toLocaleString()}đ
                  </p>
                  <p>
                    <strong>Trạng thái:</strong> {reservation.trangThai}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
