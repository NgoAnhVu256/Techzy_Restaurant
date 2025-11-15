import React, { useEffect, useMemo, useState } from "react";
import "./Sidebar.css";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiGrid,
  FiShoppingBag,
  FiBookOpen,
  FiArchive,
  FiUsers,
  FiBarChart2,
  FiClipboard,
  FiCalendar,
  FiTable,
  FiLayers,
  FiUser,
  FiTrendingUp,
} from "react-icons/fi";

const sidebarMenu = [
  {
    id: "dashboard",
    type: "single",
    label: "Dashboard",
    icon: <FiGrid />,
    to: "/dashboard",
  },
  {
    id: "sales",
    label: "🍽️ Quản lý Bán hàng",
    icon: <FiShoppingBag />,
    children: [
      { to: "/order", label: "Order (Đơn hàng)", icon: <FiClipboard /> },
      {
        to: "/reservations",
        label: "Reservations (Đặt bàn)",
        icon: <FiCalendar />,
      },
      { to: "/tables", label: "Tables (Sơ đồ bàn)", icon: <FiTable /> },
    ],
  },
  {
    id: "menu",
    label: "🥑 Quản lý Thực đơn",
    icon: <FiBookOpen />,
    children: [
      { to: "/foods", label: "Foods (Danh sách món ăn)", icon: <FiLayers /> },
      {
        to: "/categories",
        label: "Categories (Loại món)",
        icon: <FiArchive />,
      },
    ],
  },
  {
    id: "inventory",
    label: "📦 Quản lý Kho",
    icon: <FiArchive />,
    children: [
      { to: "/storage", label: "Storage (Tồn kho)", icon: <FiArchive /> },
      {
        to: "/suppliers",
        label: "Suppliers (Nhà cung cấp)",
        icon: <FiShoppingBag />,
      },
    ],
  },
  {
    id: "people",
    label: "👥 Quản lý Nhân sự",
    icon: <FiUsers />,
    children: [
      { to: "/employees", label: "Employees (Nhân viên)", icon: <FiUser /> },
      {
        to: "/departments",
        label: "Departments (Phòng ban)",
        icon: <FiLayers />,
      },
      { to: "/shifts", label: "Shifts (Quản lý ca)", icon: <FiClipboard /> },
      {
        to: "/workschedule",
        label: "WorkSchedule (Lịch làm việc)",
        icon: <FiCalendar />,
      },
    ],
  },
  {
    id: "business",
    label: "📈 Kinh doanh & Báo cáo",
    icon: <FiBarChart2 />,
    children: [
      { to: "/customers", label: "Customers (Khách hàng)", icon: <FiUsers /> },
      {
        to: "/promotions",
        label: "Promotions (Khuyến mãi)",
        icon: <FiTrendingUp />,
      },
      {
        to: "/statistics",
        label: "Statistics (Thống kê)",
        icon: <FiBarChart2 />,
      },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();

  const initialOpen = useMemo(() => {
    const result = {};
    sidebarMenu.forEach((item) => {
      if (item.children) {
        const isActive = item.children.some((child) =>
          location.pathname.startsWith(child.to)
        );
        result[item.id] = isActive;
      }
    });
    return result;
  }, [location.pathname]);

  const [openMenus, setOpenMenus] = useState(initialOpen);

  useEffect(() => {
    sidebarMenu.forEach((item) => {
      if (item.children) {
        const isActive = item.children.some((child) =>
          location.pathname.startsWith(child.to)
        );
        if (isActive) {
          setOpenMenus((prev) => ({ ...prev, [item.id]: true }));
        }
      }
    });
  }, [location.pathname]);

  const toggleMenu = (id) => {
    setOpenMenus((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNavLink = (route) => (
    <NavLink
      key={route.to}
      to={route.to}
      className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
    >
      <span className="link-icon">{route.icon}</span>
      <span className="link-label">{route.label}</span>
    </NavLink>
  );

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">TR</div>
        <div className="logo-text">
          <p>Techzy Restaurant</p>
          <span>Admin Portal</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        {sidebarMenu.map((item) =>
          item.type === "single" ? (
            <div key={item.id} className="sidebar-single">
              {renderNavLink(item)}
            </div>
          ) : (
            <div
              key={item.id}
              className={`sidebar-group ${
                item.children.some((child) =>
                  location.pathname.startsWith(child.to)
                )
                  ? "group-active"
                  : ""
              }`}
            >
              <button
                className="group-header"
                onClick={() => toggleMenu(item.id)}
              >
                <span className="group-title">
                  <span className="group-icon">{item.icon}</span>
                  {item.label}
                </span>
                <span
                  className={`group-caret ${openMenus[item.id] ? "open" : ""}`}
                >
                  ▾
                </span>
              </button>
              {openMenus[item.id] && (
                <div className="sidebar-submenu">
                  {item.children.map((route) => renderNavLink(route))}
                </div>
              )}
            </div>
          )
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
