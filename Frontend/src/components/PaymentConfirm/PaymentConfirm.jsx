import React from "react";

const PaymentConfirm = ({ show, onClose }) => {
  if (!show) return null;
  return (
    <div
      className="payment-popup-backdrop"
      onClick={(e) => {
        if (e.target.className === "payment-popup-backdrop") onClose();
      }}
    >
      <div className="payment-popup-container">
        <button className="payment-popup-close" onClick={onClose}>
          ×
        </button>
        <h2>Xác nhận thanh toán</h2>
        <div style={{ textAlign: "center", margin: "20px 0" }}>
          <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
          <p>
            Chúng tôi sẽ xử lý đơn hàng của bạn trong thời gian sớm nhất.
            <br />
            Đơn hàng của bạn đang được xử lý.
          </p>
        </div>
        <button className="payment-popup-confirm-button" onClick={onClose}>
          Đóng
        </button>
      </div>
    </div>
  );
};

export default PaymentConfirm;
