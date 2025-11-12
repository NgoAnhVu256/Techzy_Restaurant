import React, { useState, useContext, useEffect, useRef } from "react";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { StoreContext } from "../../Context/StoreContext";

const Navbar = ({ setShowLogin }) => {
  const [menu, setMenu] = useState("Home");
  const [isFixed, setIsFixed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { getTotalCartAmount, isLoggedIn, user, logout } =
    useContext(StoreContext);

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

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  return (
    <div className={`navbar ${isFixed ? "navbar-fixed" : ""}`}>
      <Link to="/">
        <img src={assets.logo} alt="" className="logo" />
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
        <li
          onClick={() => {
            setMenu("Menu");
            handleScroll("food-display");
          }}
          className={menu === "Menu" ? "active" : ""}
        >
          Thực đơn
        </li>
        <li
          onClick={() => {
            setMenu("Reservation");
            handleScroll("reservation-section");
          }}
          className={menu === "Reservation" ? "active" : ""}
        >
          Đặt bàn
        </li>
        <li
          onClick={() => {
            setMenu("About Us");
            handleScroll("about-us");
            window.dispatchEvent(new Event("aboutUsClick"));
          }}
          className={menu === "About Us" ? "active" : ""}
        >
          Giới thiệu
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
