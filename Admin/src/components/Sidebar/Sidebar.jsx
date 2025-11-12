import React from "react";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { assets1 } from "../../assets/assets1";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const handleLogout = () => {
    window.location.reload();
  };

  const menuItems = [
    {
      section: "",
      items: [
        { to: "/dashboard", label: "Tổng quan", icon: assets.order_icon },
      ],
    },
    {
      section: "Quản lý nhà hàng",
      items: [
        { to: "/categories", label: "Loại món", icon: assets.order_icon },
        { to: "/foods", label: "Món ăn", icon: assets.order_icon },
        { to: "/tables", label: "Bàn ăn", icon: assets.order_icon },
        { to: "/reservations", label: "Đặt bàn", icon: assets.order_icon },
      ],
    },
    {
      section: "Quản lý nhân sự",
      items: [
        {
          to: "/human-resources",
          label: "Tổng quan nhân sự",
          icon: assets.order_icon,
        },
      ],
    },
    {
      section: "Quản lý kho",
      items: [
        { to: "/storage", label: "Kho", icon: assets.order_icon },
        { to: "/suppliers", label: "Nhà cung cấp", icon: assets.order_icon },
      ],
    },
    {
      section: "Khách hàng & Khuyến mãi",
      items: [
        { to: "/customers", label: "Khách hàng", icon: assets.order_icon },
        { to: "/promotions", label: "Khuyến mãi", icon: assets.order_icon },
      ],
    },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-options">
        {menuItems.map((menu, idx) => (
          <div key={idx}>
            {menu.section && (
              <div className="sidebar-section">{menu.section}</div>
            )}
            {menu.items.map((item, i) => (
              <NavLink to={item.to} key={i} className="sidebar-option" end>
                <img src={item.icon} alt={item.label} />
                <p>{item.label}</p>
              </NavLink>
            ))}
          </div>
        ))}

        <div className="logout-option">
          <div className="sidebar-option" onClick={handleLogout}>
            <img src={assets1.logout_icon} alt="logout" />
            <p>Đăng xuất</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
