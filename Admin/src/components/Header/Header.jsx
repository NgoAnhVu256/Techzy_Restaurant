import React, { useState, useEffect } from "react";
import { Dropdown } from "antd";
import { FiSearch, FiLogOut } from "react-icons/fi";
import { assets } from "../../assets/assets";
import { toast } from "react-toastify";
import "./Header.css";

const Header = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    // Xóa token và user info
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    
    // Hiển thị thông báo
    toast.success("Đăng xuất thành công");
    
    // Redirect về trang login bằng cách reload trang
    window.location.href = "/login";
  };

  const userMenuItems = [
    {
      key: "profile",
      label: (
        <div style={{ padding: "4px 0" }}>
          <div style={{ fontWeight: 500 }}>{user?.HoTen || "Admin"}</div>
          <div style={{ fontSize: "12px", color: "#8c8c8c" }}>
            {user?.TenVaiTro || "Administrator"}
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FiLogOut />
          <span>Đăng xuất</span>
        </div>
      ),
      onClick: handleLogout,
    },
  ];

  return (
    <header className="admin-header">
      <div className="header-search">
        <FiSearch />
        <input type="text" placeholder="Tìm kiếm báo cáo, đơn hàng, khách hàng..." />
      </div>

      <div className="header-actions">
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <div className="header-profile" style={{ cursor: "pointer" }}>
            <img
              src={assets?.profile_image || "https://via.placeholder.com/40"}
              alt="Admin"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/40";
              }}
            />
            <div>
              <p className="profile-name">{user?.HoTen || "Admin"}</p>
              <span className="profile-role">
                {user?.TenVaiTro || "Administrator"}
              </span>
            </div>
          </div>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;

