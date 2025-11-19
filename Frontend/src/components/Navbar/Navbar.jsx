import React, { useState, useContext, useEffect, useRef } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";
import LoginPopup from "../LoginPopup/LoginPopup";

const Navbar = () => {
  const [menu, setMenu] = useState("Home");
  const [isFixed, setIsFixed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { getTotalCartAmount, getCartItemsWithDetails, token, user, logout } =
    useContext(StoreContext);

  const cartItems = getCartItemsWithDetails();
  const totalAmount = getTotalCartAmount();

  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector(".header");
      if (header) {
        const headerHeight = header.offsetHeight;
        const scrollPosition = window.scrollY;
        setIsFixed(scrollPosition > headerHeight - 80);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleScroll = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      const navbarHeight = 80;
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navbarHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    // Update active menu based on current route
    const path = location.pathname;
    if (path === "/") setMenu("Home");
    else if (path === "/menu") setMenu("Menu");
    else if (path === "/reservation") setMenu("Reservation");
  }, [location]);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate("/");
  };

  const handleCartClick = () => {
    if (!token) {
      setShowLogin(true);
    } else {
      navigate("/order");
    }
  };

  return (
    <>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      <div className={`navbar ${isFixed ? "navbar-fixed" : ""}`}>
        <Link to="/">
          <img src={assets.logo} alt="Logo" className="logo" />
        </Link>
        <ul className="navbar-menu">
          <Link to="/">
            <li
              onClick={() => setMenu("Home")}
              className={menu === "Home" ? "active" : ""}
            >
              Trang chủ
            </li>
          </Link>
          <Link to="/menu">
            <li
              onClick={() => setMenu("Menu")}
              className={menu === "Menu" ? "active" : ""}
            >
              Thực đơn
            </li>
          </Link>
          <Link to="/reservation">
            <li
              onClick={() => setMenu("Reservation")}
              className={menu === "Reservation" ? "active" : ""}
            >
              Đặt bàn
            </li>
          </Link>
        </ul>
        <div className="navbar-right">
          <div className="navbar-cart" onClick={handleCartClick}>
            <img src={assets.basket_icon} alt="Cart" />
            {cartItems.length > 0 && (
              <div className="cart-count">{cartItems.length}</div>
            )}
            {totalAmount > 0 && (
              <div className="cart-total">{totalAmount.toLocaleString("vi-VN")} VNĐ</div>
            )}
          </div>
          {token ? (
            <div className="navbar-user" ref={dropdownRef}>
              <div
                className="user-info"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <span>{user?.HoTen || "User"}</span>
                <img src={assets.profile_icon} alt="Profile" />
              </div>
              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-item" onClick={handleLogout}>
                    <img src={assets.logout_icon} alt="Logout" />
                    <span>Đăng xuất</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="login-btn" onClick={() => setShowLogin(true)}>
              Đăng nhập
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
