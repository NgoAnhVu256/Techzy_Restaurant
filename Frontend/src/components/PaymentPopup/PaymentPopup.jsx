import React, { useState } from "react";
import "./PaymentPopup.css";
import PaymentConfirm from "../PaymentConfirm/PaymentConfirm";

const paymentOptions = [
  {
    label: "Bank Account (VietQR)",
    img: "/images/Screenshot_2025-05-22-14-08-17-679_com.VCB.jpg",
    alt: "Bank Account QR",
    description: "Scan this QR code to pay via bank account.",
  },
  {
    label: "Mobile Account (MoMo)",
    img: "/images/Screenshot_2025-05-22-14-10-24-448_com.mservice.momotransfer.jpg",
    alt: "Mobile Account QR",
    description: "Scan this QR code to pay via MoMo.",
  },
];

const PaymentPopup = ({ show, onClose }) => {
  const [selected, setSelected] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  if (!show) return null;
  return (
    <>
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
          <h2>Chọn phương thức thanh toán</h2>
          <div className="payment-popup-options">
            {paymentOptions.map((option, idx) => (
              <button
                key={option.label}
                className={`payment-popup-option${
                  selected === idx ? " selected" : ""
                }`}
                onClick={() => setSelected(idx)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="payment-popup-qr-section">
            <img
              src={paymentOptions[selected].img}
              alt={paymentOptions[selected].alt}
              className="payment-popup-qr-img"
            />
            <p>{paymentOptions[selected].description}</p>
          </div>
          <button
            className="payment-popup-confirm-button"
            onClick={() => setShowConfirm(true)}
          >
            I have done my payment
          </button>
        </div>
      </div>
      <PaymentConfirm
        show={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          onClose();
        }}
      />
    </>
  );
};

export default PaymentPopup;
