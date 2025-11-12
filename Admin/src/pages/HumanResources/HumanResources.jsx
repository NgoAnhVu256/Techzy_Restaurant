import React from "react";
import { Link } from "react-router-dom";
import "./HumanResources.css";
import { assets } from "../../assets/assets";

const HumanResources = () => {
  const modules = [
    {
      title: "Nhân viên",
      description: "Quản lý thông tin và phân công nhân viên",
      icon: assets.order_icon,
      path: "/employees",
    },
    {
      title: "Bộ phận",
      description: "Phân chia nhân viên theo bộ phận",
      icon: assets.order_icon,
      path: "/departments",
    },
    {
      title: "Ca làm việc",
      description: "Quản lý thời gian làm việc",
      icon: assets.order_icon,
      path: "/shifts",
    },
    {
      title: "Lịch làm việc",
      description: "Sắp xếp ca làm cho nhân viên",
      icon: assets.order_icon,
      path: "/workschedule",
    },
    {
      title: "Chấm công",
      description: "Theo dõi giờ làm của nhân viên",
      icon: assets.order_icon,
      path: "/attendance",
    },
  ];

  return (
    <div className="human-resources-container">
      <div className="human-resources-header">
        <h2>Quản lý nhân sự</h2>
      </div>

      <div className="modules-grid">
        {modules.map((module, index) => (
          <Link to={module.path} key={index} className="module-card">
            <div className="module-icon">
              <img src={module.icon} alt={module.title} />
            </div>
            <div className="module-info">
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HumanResources;
