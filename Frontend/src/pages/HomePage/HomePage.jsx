import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";
import { assets } from "../../assets/assets";

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Chào mừng đến với Techzy Restaurant</h1>
          <p className="hero-subtitle">
            Khám phá hương vị ẩm thực đặc biệt với những món ăn tinh tế
          </p>
          <div className="hero-buttons">
            <Link to="/menu" className="btn btn-primary">
              Xem Thực đơn
            </Link>
            <Link to="/reservation" className="btn btn-secondary">
              Đặt bàn
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Tại sao chọn chúng tôi?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <img src={assets.icons?.star || ""} alt="Quality" />
              <h3>Chất lượng cao</h3>
              <p>Nguyên liệu tươi ngon, chế biến cẩn thận</p>
            </div>
            <div className="feature-card">
              <img src={assets.icons?.truckFast || ""} alt="Fast" />
              <h3>Giao hàng nhanh</h3>
              <p>Đặt hàng online, giao tận nơi trong 30 phút</p>
            </div>
            <div className="feature-card">
              <img src={assets.icons?.shieldTick || ""} alt="Safe" />
              <h3>An toàn vệ sinh</h3>
              <p>Đảm bảo vệ sinh an toàn thực phẩm</p>
            </div>
            <div className="feature-card">
              <img src={assets.icons?.support || ""} alt="Support" />
              <h3>Hỗ trợ 24/7</h3>
              <p>Đội ngũ nhân viên chuyên nghiệp, nhiệt tình</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

