import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section brand">
          <img src={assets.logo} alt="Logo" className="footer-logo" />
          <p className="brand-description">
            Thưởng thức tinh hoa ẩm thực với những món ăn tuyệt vời và không
            gian phục vụ ấm cúng, tận tình.
          </p>
          <div className="social-links">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bx bxl-facebook"></i>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bx bxl-instagram"></i>
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bx bxl-twitter"></i>
            </a>
          </div>
        </div>

        <div className="footer-section contact">
          <h3>Liên hệ với chúng tôi</h3>
          <div className="contact-info">
            <p>
              <i className="bx bx-map"></i> 10/80c Song Hành Xa Lộ Hà Nội,
              Phường Tân Phú, Thủ Đức, Hồ Chí Minh, Việt Nam
            </p>
            <p>
              <i className="bx bx-phone"></i> 088.123.9876
            </p>
            <p>
              <i className="bx bx-envelope"></i> info@restaurant.com
            </p>
          </div>
        </div>

        <div className="footer-section hours">
          <h3>Giờ mở cửa</h3>
          <div className="hours-info">
            <p>Thứ 2 - Thứ 6: 11:00 - 22:00 </p>
            <p>Thứ 7: 10:00 - 23:00 </p>
            <p>Chủ nhật: 10:00 - 21:00</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 Techzy Restaurant . All rights reserved.</p>
        <div className="footer-bottom-links">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
