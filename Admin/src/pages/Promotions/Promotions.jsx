import React, { useState, useEffect } from "react";
import "./Promotions.css";
import axios from "axios";

// Cấu hình axios
axios.defaults.baseURL = "http://localhost:5078";

// Component hiển thị thông báo lỗi
const ErrorNotification = ({ errors, onClose }) => {
  if (!errors || errors.length === 0) return null;

  // Phân loại lỗi
  const categorizeErrors = (errors) => {
    const categories = {
      validation: [], // Lỗi validation
      server: [], // Lỗi từ server
      system: [], // Lỗi hệ thống
    };

    const errorArray = Array.isArray(errors) ? errors : [errors];

    errorArray.forEach((error) => {
      const errorStr = error.toString().toLowerCase();
      if (errorStr.includes("server") || errorStr.includes("kết nối")) {
        categories.server.push(error);
      } else if (
        errorStr.includes("validation") ||
        errorStr.includes("hợp lệ") ||
        errorStr.includes("không được") ||
        errorStr.includes("phải") ||
        errorStr.includes("vui lòng")
      ) {
        categories.validation.push(error);
      } else {
        categories.system.push(error);
      }
    });

    return categories;
  };

  const categorizedErrors = categorizeErrors(errors);

  return (
    <div
      className="error-notification"
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        backgroundColor: "#fff",
        border: "1px solid #ffcdd2",
        borderRadius: "8px",
        padding: "20px",
        maxWidth: "400px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 1000,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
          borderBottom: "1px solid #ffcdd2",
          paddingBottom: "10px",
        }}
      >
        <h4
          style={{
            margin: 0,
            color: "#d32f2f",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          ⚠️ Có lỗi xảy ra
        </h4>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#666",
            cursor: "pointer",
            fontSize: "20px",
            padding: "0 5px",
          }}
        >
          ×
        </button>
      </div>

      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
        {categorizedErrors.validation.length > 0 && (
          <div style={{ marginBottom: "15px" }}>
            <h5
              style={{
                margin: "0 0 8px 0",
                color: "#d32f2f",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Lỗi nhập liệu:
            </h5>
            <ul
              style={{
                margin: 0,
                paddingLeft: "20px",
                color: "#d32f2f",
                fontSize: "13px",
                listStyleType: "none",
              }}
            >
              {categorizedErrors.validation.map((error, index) => (
                <li key={index} style={{ marginBottom: "5px" }}>
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {categorizedErrors.server.length > 0 && (
          <div style={{ marginBottom: "15px" }}>
            <h5
              style={{
                margin: "0 0 8px 0",
                color: "#d32f2f",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Lỗi kết nối:
            </h5>
            <ul
              style={{
                margin: 0,
                paddingLeft: "20px",
                color: "#d32f2f",
                fontSize: "13px",
                listStyleType: "none",
              }}
            >
              {categorizedErrors.server.map((error, index) => (
                <li key={index} style={{ marginBottom: "5px" }}>
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {categorizedErrors.system.length > 0 && (
          <div>
            <h5
              style={{
                margin: "0 0 8px 0",
                color: "#d32f2f",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              Lỗi khác:
            </h5>
            <ul
              style={{
                margin: 0,
                paddingLeft: "20px",
                color: "#d32f2f",
                fontSize: "13px",
                listStyleType: "none",
              }}
            >
              {categorizedErrors.system.map((error, index) => (
                <li key={index} style={{ marginBottom: "5px" }}>
                  • {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "15px",
          paddingTop: "10px",
          borderTop: "1px solid #ffcdd2",
          textAlign: "right",
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: "6px 12px",
            backgroundColor: "#d32f2f",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

// Component hiển thị lỗi cho từng trường
const FieldError = ({ error }) => {
  if (!error) return null;

  return (
    <div
      style={{
        color: "#d32f2f",
        fontSize: "12px",
        marginTop: "4px",
        display: "flex",
        alignItems: "flex-start",
        gap: "4px",
        backgroundColor: "#ffebee",
        padding: "6px 8px",
        borderRadius: "4px",
        border: "1px solid #ffcdd2",
      }}
    >
      <span style={{ fontSize: "14px" }}>⚠️</span>
      <span>{error}</span>
    </div>
  );
};

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showError, setShowError] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    tenKhuyenMai: "",
    moTa: "",
    phanTramGiam: 0,
    ngayBatDau: "",
    ngayKetThuc: "",
    dieuKien: "Không có điều kiện",
    trangThai: true,
    maMon: [],
  });

  // Fetch promotions
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/KhuyenMai");
      console.log("Promotions data:", response.data);
      setPromotions(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching promotions:", err);
      setError(
        "Không thể tải danh sách khuyến mãi: " +
          (err.response?.data || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch dishes
  const fetchDishes = async () => {
    try {
      const response = await axios.get("/api/MonAn");
      console.log("Dishes data:", response.data);
      setDishes(response.data);
    } catch (err) {
      console.error("Error fetching dishes:", err);
      setError(
        "Không thể tải danh sách món ăn: " +
          (err.response?.data || err.message)
      );
    }
  };

  // Fetch stats
  const fetchStats = async (id) => {
    try {
      const response = await axios.get(`/api/KhuyenMai/stats/${id}`);
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError(
        "Không thể tải thống kê: " + (err.response?.data || err.message)
      );
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchDishes();
  }, []);

  // Hàm xử lý lỗi từ server
  const handleServerError = (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Xử lý lỗi validation từ server
      if (status === 400) {
        if (data && typeof data === "object") {
          // Xử lý lỗi validation từ ASP.NET Core
          if (data.title === "One or more validation errors occurred.") {
            const validationErrors = [];
            if (data.errors) {
              Object.entries(data.errors).forEach(([field, errors]) => {
                if (Array.isArray(errors)) {
                  errors.forEach((err) => {
                    // Chuyển đổi tên trường sang tiếng Việt
                    const fieldName = translateFieldName(field);
                    validationErrors.push(`${fieldName}: ${err}`);
                  });
                }
              });
            }
            return validationErrors.length > 0
              ? validationErrors
              : ["Dữ liệu không hợp lệ"];
          }
          // Xử lý các lỗi khác từ server
          return [data.message || "Dữ liệu không hợp lệ"];
        }
        return [
          "Dữ liệu không hợp lệ: " +
            (typeof data === "string"
              ? data
              : "Vui lòng kiểm tra lại thông tin"),
        ];
      }

      // Xử lý các lỗi khác
      switch (status) {
        case 409:
          return ["Khuyến mãi này đã tồn tại trong hệ thống"];
        case 500:
          return ["Lỗi server: Vui lòng thử lại sau"];
        default:
          return [data?.message || "Có lỗi xảy ra, vui lòng thử lại"];
      }
    }

    if (error.request) {
      return ["Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng"];
    }

    return ["Có lỗi xảy ra: " + error.message];
  };

  // Hàm chuyển đổi tên trường sang tiếng Việt
  const translateFieldName = (field) => {
    const translations = {
      tenKhuyenMai: "Tên khuyến mãi",
      moTa: "Mô tả",
      phanTramGiam: "Phần trăm giảm",
      ngayBatDau: "Ngày bắt đầu",
      ngayKetThuc: "Ngày kết thúc",
      dieuKien: "Điều kiện",
      trangThai: "Trạng thái",
      maMon: "Món ăn",
    };
    return translations[field] || field;
  };

  // Validate từng trường với thông báo chi tiết hơn
  const validateField = (name, value) => {
    switch (name) {
      case "tenKhuyenMai":
        if (!value.trim()) return "Vui lòng nhập tên khuyến mãi";
        if (value.trim().length < 3)
          return "Tên khuyến mãi phải có ít nhất 3 ký tự";
        if (value.trim().length > 100)
          return "Tên khuyến mãi không được vượt quá 100 ký tự";
        return "";

      case "phanTramGiam":
        const num = Number(value);
        if (isNaN(num)) return "Phần trăm giảm giá phải là số";
        if (num <= 0) return "Phần trăm giảm giá phải lớn hơn 0%";
        if (num > 100) return "Phần trăm giảm giá không được vượt quá 100%";
        return "";

      case "ngayBatDau":
        if (!value) return "Vui lòng chọn ngày bắt đầu";
        const startDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (startDate < today) {
          return "Ngày bắt đầu không được trước ngày hiện tại";
        }
        return "";

      case "ngayKetThuc":
        if (!value) return "Vui lòng chọn ngày kết thúc";
        const endDate = new Date(value);
        const startDateValue = new Date(formData.ngayBatDau);
        if (endDate <= startDateValue) {
          return "Ngày kết thúc phải sau ngày bắt đầu";
        }
        return "";

      case "maMon":
        if (!value || value.length === 0) return "Vui lòng chọn ít nhất một món ăn";
        return "";

      default:
        return "";
    }
  };

  // Validate toàn bộ form
  const validateForm = () => {
    const errors = {};
    let hasError = false;

    // Validate từng trường
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        errors[key] = error;
        hasError = true;
      }
    });

    // Validate danh sách món ăn riêng
    const dishError = validateField("maMon", selectedDishes);
    if (dishError) {
      errors.maMon = dishError;
      hasError = true;
    }

    console.log("Validation results:", {
      selectedDishes,
      dishError,
      errors,
      hasError,
    });

    setFieldErrors(errors);
    return !hasError;
  };

  // Handle input change với validation
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Chỉ validate khi đã submit form và có lỗi
    if (showError) {
      const error = validateField(name, newValue);
      setFieldErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  // Handle dish selection
  const handleDishChange = (dishId, checked) => {
    const numericDishId = Number(dishId);
    const newSelected = checked
      ? [...selectedDishes, numericDishId]
      : selectedDishes.filter((id) => id !== numericDishId);

    setSelectedDishes(newSelected);

    if (showError) {
      const error = validateField("maMon", newSelected);
      setFieldErrors((prev) => ({
        ...prev,
        maMon: error,
      }));
    }
  };

  const handleAddPromotion = async (e) => {
    e.preventDefault();
    setShowError(true);

    const errors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/KhuyenMai", {
        ...formData,
        maMon: selectedDishes,
      });
      console.log("Add promotion response:", response.data);
      setShowAddModal(false);
      resetForm();
      fetchPromotions();
    } catch (err) {
      console.error("Error adding promotion:", err);
      setError(
        "Không thể thêm khuyến mãi: " + (err.response?.data || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditPromotion = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`/api/KhuyenMai/${currentPromotion.maKhuyenMai}`, {
        ...formData,
        maMon: selectedDishes,
      });
      setShowEditModal(false);
      resetForm();
      fetchPromotions();
    } catch (err) {
      console.error("Error updating promotion:", err);
      setError(
        "Không thể cập nhật khuyến mãi: " + (err.response?.data || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePromotion = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa khuyến mãi này?")) return;

    try {
      setLoading(true);
      await axios.delete(`/api/KhuyenMai/${id}`);
      fetchPromotions();
    } catch (err) {
      console.error("Error deleting promotion:", err);
      setError(
        "Không thể xóa khuyến mãi: " + (err.response?.data || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewStats = async (promotion) => {
    setCurrentPromotion(promotion);
    await fetchStats(promotion.maKhuyenMai);
    setShowStatsModal(true);
  };

  // Reset form và errors
  const resetForm = () => {
    setFormData({
      tenKhuyenMai: "",
      moTa: "",
      phanTramGiam: 0,
      ngayBatDau: "",
      ngayKetThuc: "",
      dieuKien: "Không có điều kiện",
      trangThai: true,
      maMon: [],
    });
    setSelectedDishes([]);
    setFieldErrors({});
    setShowError(false);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (promotion) => {
    setCurrentPromotion(promotion);
    setFormData({
      tenKhuyenMai: promotion.tenKhuyenMai,
      moTa: promotion.moTa,
      phanTramGiam: promotion.phanTramGiam,
      ngayBatDau: promotion.ngayBatDau.split("T")[0],
      ngayKetThuc: promotion.ngayKetThuc.split("T")[0],
      dieuKien: promotion.dieuKien,
      trangThai: promotion.trangThai,
      maMon: promotion.maMon,
    });
    setSelectedDishes(promotion.maMon);
    setShowEditModal(true);
  };

  return (
    <div className="promotions-container">
      {/* Error Notification */}
      {showError && (error || Object.keys(fieldErrors).length > 0) && (
        <ErrorNotification
          errors={error || Object.values(fieldErrors)}
          onClose={() => setShowError(false)}
        />
      )}

      <div className="promotions-header">
        <h2>Quản lý khuyến mãi</h2>
        <button className="add-button" onClick={openAddModal}>
          <span>+</span> Thêm khuyến mãi
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <span>Đang tải dữ liệu...</span>
        </div>
      ) : promotions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>Chưa có khuyến mãi nào</h3>
          <p>Bắt đầu bằng cách thêm khuyến mãi mới</p>
          <button className="add-button" onClick={openAddModal}>
            <span>+</span> Thêm khuyến mãi đầu tiên
          </button>
        </div>
      ) : (
        <div className="promotions-list">
          {promotions.map((promotion) => (
            <div key={promotion.maKhuyenMai} className="promotion-card">
              <div className="promotion-header">
                <h3>
                  {promotion.tenKhuyenMai}
                  <span
                    className={`status-badge ${
                      promotion.trangThai ? "status-active" : "status-inactive"
                    }`}
                  >
                    {promotion.trangThai ? "Đang áp dụng" : "Đã kết thúc"}
                  </span>
                </h3>
                <div className="promotion-actions">
                  <button
                    onClick={() => openEditModal(promotion)}
                    title="Sửa khuyến mãi"
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => handleDeletePromotion(promotion.maKhuyenMai)}
                    title="Xóa khuyến mãi"
                  >
                    🗑️ Xóa
                  </button>
                  <button
                    onClick={() => handleViewStats(promotion)}
                    title="Xem thống kê"
                  >
                    📊 Thống kê
                  </button>
                </div>
              </div>
              <div className="promotion-details">
                <p>
                  <strong>Mô tả:</strong>
                  <span>{promotion.moTa || "Không có mô tả"}</span>
                </p>
                <p>
                  <strong>Giảm giá:</strong>
                  <span className="discount-badge">
                    {promotion.phanTramGiam}%
                  </span>
                </p>
                <p>
                  <strong>Thời gian:</strong>
                  <span>
                    {new Date(promotion.ngayBatDau).toLocaleDateString("vi-VN")}{" "}
                    -{" "}
                    {new Date(promotion.ngayKetThuc).toLocaleDateString(
                      "vi-VN"
                    )}
                  </span>
                </p>
                <p>
                  <strong>Điều kiện:</strong>
                  <span>{promotion.dieuKien}</span>
                </p>
                <p>
                  <strong>Áp dụng cho:</strong>
                  <span className="dish-tags">
                    {promotion.maMon.map((ma) => {
                      const dish = dishes.find((d) => d.maMon === ma);
                      return dish ? (
                        <span key={ma} className="dish-tag">
                          {dish.tenMon}
                        </span>
                      ) : null;
                    })}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Thêm khuyến mãi mới</h3>
            <form onSubmit={handleAddPromotion}>
              <div className="form-group">
                <label htmlFor="tenKhuyenMai">
                  Tên khuyến mãi <span className="required">*</span>
                </label>
                <input
                  id="tenKhuyenMai"
                  type="text"
                  name="tenKhuyenMai"
                  value={formData.tenKhuyenMai}
                  onChange={handleInputChange}
                  placeholder="Nhập tên khuyến mãi"
                  required
                  className={fieldErrors.tenKhuyenMai ? "error" : ""}
                />
                <FieldError error={fieldErrors.tenKhuyenMai} />
              </div>

              <div className="form-group">
                <label htmlFor="moTa">Mô tả</label>
                <textarea
                  id="moTa"
                  name="moTa"
                  value={formData.moTa}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả khuyến mãi"
                  className={fieldErrors.moTa ? "error" : ""}
                />
                <FieldError error={fieldErrors.moTa} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phanTramGiam">
                    Phần trăm giảm <span className="required">*</span>
                  </label>
                  <div className="input-with-suffix">
                    <input
                      id="phanTramGiam"
                      type="number"
                      name="phanTramGiam"
                      min="1"
                      max="100"
                      value={formData.phanTramGiam}
                      onChange={handleInputChange}
                      placeholder="Nhập phần trăm giảm giá"
                      required
                      className={fieldErrors.phanTramGiam ? "error" : ""}
                    />
                    <span className="suffix">%</span>
                  </div>
                  <FieldError error={fieldErrors.phanTramGiam} />
                </div>

                <div className="form-group">
                  <label>Trạng thái</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="trangThai"
                      name="trangThai"
                      checked={formData.trangThai}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="trangThai"></label>
                    <span>
                      {formData.trangThai ? "Đang áp dụng" : "Đã kết thúc"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="ngayBatDau">
                    Ngày bắt đầu <span className="required">*</span>
                  </label>
                  <input
                    id="ngayBatDau"
                    type="date"
                    name="ngayBatDau"
                    value={formData.ngayBatDau}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    className={fieldErrors.ngayBatDau ? "error" : ""}
                  />
                  <FieldError error={fieldErrors.ngayBatDau} />
                </div>

                <div className="form-group">
                  <label htmlFor="ngayKetThuc">
                    Ngày kết thúc <span className="required">*</span>
                  </label>
                  <input
                    id="ngayKetThuc"
                    type="date"
                    name="ngayKetThuc"
                    value={formData.ngayKetThuc}
                    onChange={handleInputChange}
                    min={
                      formData.ngayBatDau ||
                      new Date().toISOString().split("T")[0]
                    }
                    required
                    className={fieldErrors.ngayKetThuc ? "error" : ""}
                  />
                  <FieldError error={fieldErrors.ngayKetThuc} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="dieuKien">
                  Điều kiện <span className="required">*</span>
                </label>
                <input
                  id="dieuKien"
                  type="text"
                  name="dieuKien"
                  value={formData.dieuKien}
                  onChange={handleInputChange}
                  placeholder="Nhập điều kiện áp dụng"
                  required
                  className={fieldErrors.dieuKien ? "error" : ""}
                />
                <FieldError error={fieldErrors.dieuKien} />
              </div>

              <div className="form-group">
                <label>
                  Áp dụng cho món ăn <span className="required">*</span>
                </label>
                <div
                  className={`dish-selection ${
                    fieldErrors.maMon ? "error" : ""
                  }`}
                >
                  {dishes.length === 0 ? (
                    <div className="loading-dishes">
                      Đang tải danh sách món ăn...
                    </div>
                  ) : (
                    <div className="dish-grid">
                      {dishes.map((dish) => (
                        <label
                          key={dish.maMon}
                          className={`dish-item ${
                            selectedDishes.includes(Number(dish.maMon))
                              ? "selected"
                              : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedDishes.includes(
                              Number(dish.maMon)
                            )}
                            onChange={(e) =>
                              handleDishChange(
                                dish.maMon,
                                e.target.checked
                              )
                            }
                          />
                          <span>{dish.tenMon}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <FieldError error={fieldErrors.maMon} />
                {selectedDishes.length > 0 && (
                  <div className="selected-dishes">
                    <span className="selected-count">
                      Đã chọn {selectedDishes.length} món ăn
                    </span>
                    <div className="dish-tags">
                      {selectedDishes.map((ma) => {
                        const dish = dishes.find(
                          (d) => Number(d.maMon) === ma
                        );
                        return dish ? (
                          <span key={ma} className="dish-tag">
                            {dish.tenMon}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                <small className="form-help">
                  Chọn các món ăn sẽ được áp dụng khuyến mãi
                </small>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="cancel-button"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Đang thêm...
                    </>
                  ) : (
                    "Thêm khuyến mãi"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal - Similar structure to Add Modal */}
      {showEditModal && currentPromotion && (
        <div className="modal">
          <div className="modal-content">
            <h3>Sửa khuyến mãi</h3>
            <form onSubmit={handleEditPromotion}>
              <div className="form-group">
                <label htmlFor="tenKhuyenMai">Tên khuyến mãi</label>
                <input
                  id="tenKhuyenMai"
                  type="text"
                  name="tenKhuyenMai"
                  value={formData.tenKhuyenMai}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="moTa">Mô tả</label>
                <textarea
                  id="moTa"
                  name="moTa"
                  value={formData.moTa}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phanTramGiam">Phần trăm giảm</label>
                <input
                  id="phanTramGiam"
                  type="number"
                  name="phanTramGiam"
                  min="0"
                  max="100"
                  value={formData.phanTramGiam}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="ngayBatDau">Ngày bắt đầu</label>
                <input
                  id="ngayBatDau"
                  type="date"
                  name="ngayBatDau"
                  value={formData.ngayBatDau}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="ngayKetThuc">Ngày kết thúc</label>
                <input
                  id="ngayKetThuc"
                  type="date"
                  name="ngayKetThuc"
                  value={formData.ngayKetThuc}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dieuKien">Điều kiện</label>
                <input
                  id="dieuKien"
                  type="text"
                  name="dieuKien"
                  value={formData.dieuKien}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Trạng thái</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    id="trangThai"
                    name="trangThai"
                    checked={formData.trangThai}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="trangThai"></label>
                  <span>
                    {formData.trangThai ? "Đang áp dụng" : "Tạm dừng"}
                  </span>
                </div>
              </div>
              <div className="form-group">
                <label>Áp dụng cho món ăn</label>
                <div
                  className={`dish-selection ${
                    fieldErrors.maMon ? "error" : ""
                  }`}
                >
                  {dishes.length === 0 ? (
                    <div className="loading-dishes">
                      Đang tải danh sách món ăn...
                    </div>
                  ) : (
                    <div className="dish-grid">
                      {dishes.map((dish) => (
                        <label
                          key={dish.maMon}
                          className={`dish-item ${
                            selectedDishes.includes(Number(dish.maMon))
                              ? "selected"
                              : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedDishes.includes(
                              Number(dish.maMon)
                            )}
                            onChange={(e) => {
                              const newSelected = e.target.checked
                                ? [
                                    ...selectedDishes,
                                    Number(dish.maMon),
                                  ]
                                : selectedDishes.filter(
                                    (id) => id !== Number(dish.maMon)
                                  );
                              setSelectedDishes(newSelected);
                              const error = validateField(
                                "maMon",
                                newSelected
                              );
                              setFieldErrors((prev) => ({
                                ...prev,
                                maMon: error,
                              }));
                            }}
                          />
                          <span>{dish.tenMon}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <FieldError error={fieldErrors.maMon} />
                {selectedDishes.length > 0 && (
                  <div className="selected-dishes">
                    <span className="selected-count">
                      Đã chọn {selectedDishes.length} món ăn
                    </span>
                    <div className="dish-tags">
                      {selectedDishes.map((ma) => {
                        const dish = dishes.find(
                          (d) => Number(d.maMon) === ma
                        );
                        return dish ? (
                          <span key={ma} className="dish-tag">
                            {dish.tenMon}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                <small className="form-help">
                  Chọn các món ăn sẽ được áp dụng khuyến mãi
                </small>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="cancel-button"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="submit-button"
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Đang cập nhật...
                    </>
                  ) : (
                    "Cập nhật"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {showStatsModal && currentPromotion && stats && (
        <div className="modal">
          <div className="modal-content">
            <h3>Thống kê khuyến mãi</h3>
            <div className="stats-header">
              <h4>{currentPromotion.tenKhuyenMai}</h4>
              <span
                className={`status-badge ${
                  currentPromotion.trangThai
                    ? "status-active"
                    : "status-inactive"
                }`}
              >
                {currentPromotion.trangThai ? "Đang áp dụng" : "Đã kết thúc"}
              </span>
            </div>
            <div className="stats-content">
              <div className="stat-item">
                <label>Số đơn hàng áp dụng</label>
                <span>{stats.soDonHang.toLocaleString("vi-VN")}</span>
              </div>
              <div className="stat-item">
                <label>Tổng doanh thu</label>
                <span>{stats.tongDoanhThu.toLocaleString("vi-VN")} VNĐ</span>
              </div>
              <div className="stat-item">
                <label>Tổng giảm giá</label>
                <span className="discount-value">
                  {stats.tongGiamGia.toLocaleString("vi-VN")} VNĐ
                </span>
              </div>
            </div>
            <div className="modal-actions">
              <button
                onClick={() => setShowStatsModal(false)}
                className="close-button"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;
