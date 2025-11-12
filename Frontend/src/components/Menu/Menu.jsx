import React, { useState, useEffect } from "react";
import "./Menu.css";
import axios from "axios";

const Menu = ({ category, setCategory }) => {
  const [menuCategories, setMenuCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:5078/api/LoaiMon");
        const formattedCategories = response.data.map((item) => ({
          menu_name: item.tenLoai,
          menu_image: `http://localhost:5078/images/${item.hinhAnh}`,
        }));
        setMenuCategories(formattedCategories);
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="menu" id="menu">
      <h1>Thực đơn của chúng tôi</h1>
      <div className="menu-list">
        {menuCategories.map((item, index) => {
          return (
            <div
              onClick={() =>
                setCategory((prev) =>
                  prev === item.menu_name ? "All" : item.menu_name
                )
              }
              key={index}
              className="menu-list-item"
            >
              <img
                className={category === item.menu_name ? "active" : ""}
                src={item.menu_image}
                alt=""
              />
              <p>{item.menu_name}</p>
            </div>
          );
        })}
      </div>
      <hr />
    </div>
  );
};

export default Menu;
