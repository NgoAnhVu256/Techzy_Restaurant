import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { assets1 } from "../../assets/assets1";

const Login = ({ setShowLogin }) => {
  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    // Ngăn chặn hành vi mặc định của form
  };

  const handleLogin = (event) => {
    // Ngăn chặn sự kiện click lan truyền
    event.stopPropagation();

    if (!values.email || !values.password) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    console.log("Đăng nhập với:", values);
    setShowLogin(false);
    navigate("/dashboard");
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
  };

  const togglePasswordVisibility = (event) => {
    event.stopPropagation(); // Ngăn chặn sự kiện click lan truyền
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-popup">
      <div className="login-popup-overlay"></div>
      <div className="login-popup-container">
        <div className="login-popup-title">
          <h2>Đăng nhập</h2>
          <img src={assets1.logo} alt="Logo" className="login-logo" />
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email của bạn"
              value={values.email}
              onChange={handleChange}
              required
              className="modern-input"
            />
          </div>

          <div className="form-group">
            <div className="input-with-icon">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mật khẩu"
                value={values.password}
                onChange={handleChange}
                required
                className="modern-input"
              />
              <i
                className={`password-toggle fas ${
                  showPassword ? "fa-eye-slash" : "fa-eye"
                }`}
                onClick={togglePasswordVisibility}
              ></i>
            </div>
          </div>

          <div className="login-popup-options">
            <label className="remember-me">
              <input
                type="checkbox"
                className="modern-checkbox"
              />
              Ghi nhớ tôi
            </label>
            <a
              href="#"
              className="forgot-password"
              onClick={(e) => e.preventDefault()}
            >
              Quên mật khẩu?
            </a>
          </div>

          <button type="button" className="login-button" onClick={handleLogin}>
            <span>Đăng nhập</span>
            <i className="fas fa-arrow-right"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
