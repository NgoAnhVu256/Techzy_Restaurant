import React from "react";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Tổng quan</h2>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Đơn hàng hôm nay</h3>
          <div className="card-content">
            <span className="number">0</span>
            <span className="label">đơn hàng</span>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Doanh thu hôm nay</h3>
          <div className="card-content">
            <span className="number">0</span>
            <span className="label">VNĐ</span>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Số món ăn</h3>
          <div className="card-content">
            <span className="number">0</span>
            <span className="label">món</span>
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Số nhân viên</h3>
          <div className="card-content">
            <span className="number">0</span>
            <span className="label">người</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
