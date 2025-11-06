import React, { useState } from "react";
import "./Navbar.css";
import { assets1 } from "../../assets/assets1";
import { assets } from "../../assets/assets";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadNotifications] = useState(3);
  const [searchTerm, setSearchTerm] = useState("");

  // Lấy tiêu đề trang từ đường dẫn
  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case "/human-resources":
        return "Quản lý nhân sự";
      case "/shifts":
        return "Ca làm việc";
      case "/account":
        return "Quản lý tài khoản";
      default:
        return "Dashboard";
    }
  };

  // Xử lý đăng xuất
  const handleLogout = async () => {
    try {
      // Gọi API đăng xuất
      await axios.post("http://localhost:5078/api/Auth/logout");

      // Xóa token từ localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Chuyển hướng về trang đăng nhập
      navigate("/login");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <img
          className="logo"
          src={assets1.logo}
          alt="Logo"
          onClick={() => navigate("/")}
        />
        <h2 className="page-title">{getPageTitle()}</h2>
      </div>

      <div className="navbar-center">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <i className="fas fa-search"></i>
        </div>
      </div>

      <div className="navbar-right">
        <div className="notification-icon">
          <i className="fas fa-bell"></i>
          {unreadNotifications > 0 && (
            <span className="notification-badge">{unreadNotifications}</span>
          )}
        </div>

        <div className="settings-icon">
          <i className="fas fa-cog" onClick={() => navigate("/account")}></i>
        </div>

        <div
          className="user-profile"
          onClick={() => setShowUserMenu(!showUserMenu)}
        >
          <img className="profile" src={assets.profile_image} alt="Profile" />
          <span className="user-name">Admin</span>
          {showUserMenu && (
            <div className="user-menu">
              <button onClick={() => navigate("/account")}>
                <i className="fas fa-user-cog"></i>
                Quản lý tài khoản
              </button>
              <button onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
