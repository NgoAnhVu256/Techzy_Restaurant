import React, { useContext, useState } from "react";
import { StoreContext } from "../../Context/StoreContext";
import FoodItem from "../../components/FoodItem/FoodItem";
import LoginPopup from "../../components/LoginPopup/LoginPopup";
import "./MenuPage.css";

const MenuPage = () => {
  const { foodList, addToCart, token } = useContext(StoreContext);
  const [showLogin, setShowLogin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Get unique categories
  const categories = ["all", ...new Set(foodList.map((item) => item.category))];

  // Filter foods by category
  const filteredFoods =
    selectedCategory === "all"
      ? foodList
      : foodList.filter((item) => item.category === selectedCategory);

  const handleAddToCart = (itemId) => {
    if (!token) {
      setShowLogin(true);
      return;
    }
    addToCart(itemId);
  };

  return (
    <div className="menu-page">
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      <div className="menu-header">
        <h1>Thực đơn</h1>
        <p>Khám phá những món ăn đặc biệt của chúng tôi</p>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? "active" : ""}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category === "all" ? "Tất cả" : category}
          </button>
        ))}
      </div>

      {/* Food Grid */}
      <div className="food-grid">
        {filteredFoods.length > 0 ? (
          filteredFoods.map((item) => (
            <FoodItem
              key={item.MaMon || item._id}
              id={item.MaMon || item._id}
              name={item.name}
              price={item.price}
              image={item.image}
              onAddToCart={() => handleAddToCart(item.MaMon || item._id)}
            />
          ))
        ) : (
          <p className="no-items">Không có món ăn nào</p>
        )}
      </div>
    </div>
  );
};

export default MenuPage;

