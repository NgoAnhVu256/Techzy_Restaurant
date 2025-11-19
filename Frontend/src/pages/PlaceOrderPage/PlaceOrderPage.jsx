import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { StoreContext } from "../../Context/StoreContext";
import api from "../../utils/axios";
import "./PlaceOrderPage.css";

const PlaceOrderPage = () => {
  const { getCartItemsWithDetails, getTotalCartAmount, token, user, setCartItems } =
    useContext(StoreContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    DiaChi: user?.DiaChi || "",
    SoDienThoai: user?.SDT || user?.SoDienThoai || "",
  });

  const cartItems = getCartItemsWithDetails();
  const totalAmount = getTotalCartAmount();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Lấy hoặc tạo khách hàng
      let customerId = user?.MaKhachHang || user?.maKhachHang;

      if (!customerId) {
        // Tạo khách hàng mới
        const customerResponse = await api.post("/customers", {
          HoTen: user?.HoTen || "",
          SoDienThoai: formData.SoDienThoai,
          Email: user?.Email || "",
          DiaChi: formData.DiaChi,
        });
        customerId = customerResponse.data.data.MaKhachHang || customerResponse.data.data.maKhachHang;
      }

      // Tạo chi tiết đơn hàng
      const ChiTietList = cartItems.map((item) => ({
        MaMon: item.MaMon || item._id,
        SoLuong: item.quantity,
      }));

      // Tạo đơn hàng
      const orderResponse = await api.post(
        "/orders",
        {
          MaKhachHang: customerId,
          ChiTietList,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Đặt hàng thành công! Chúng tôi sẽ liên hệ lại.");
      
      // Xóa giỏ hàng
      setCartItems({});
      
      // Chuyển về trang chủ
      navigate("/");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="place-order-page">
        <div className="empty-cart">
          <h2>Giỏ hàng trống</h2>
          <p>Vui lòng thêm món ăn vào giỏ hàng trước khi đặt hàng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="place-order-page">
      <div className="order-container">
        <h1>Xác nhận đơn hàng</h1>

        <div className="order-content">
          {/* Cart Summary */}
          <div className="cart-summary">
            <h2>Giỏ hàng của bạn</h2>
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.MaMon || item._id} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p>{item.price.toLocaleString("vi-VN")} VNĐ</p>
                  </div>
                  <div className="item-quantity">x{item.quantity}</div>
                  <div className="item-total">
                    {(item.price * item.quantity).toLocaleString("vi-VN")} VNĐ
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-total">
              <strong>Tổng tiền: {totalAmount.toLocaleString("vi-VN")} VNĐ</strong>
            </div>
          </div>

          {/* Delivery Form */}
          <form onSubmit={handleSubmit} className="delivery-form">
            <h2>Thông tin giao hàng</h2>

            <div className="form-group">
              <label htmlFor="SoDienThoai">Số điện thoại *</label>
              <input
                type="tel"
                id="SoDienThoai"
                name="SoDienThoai"
                value={formData.SoDienThoai}
                onChange={handleChange}
                required
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="form-group">
              <label htmlFor="DiaChi">Địa chỉ giao hàng *</label>
              <textarea
                id="DiaChi"
                name="DiaChi"
                value={formData.DiaChi}
                onChange={handleChange}
                required
                rows="3"
                placeholder="Nhập địa chỉ giao hàng"
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Đang xử lý..." : "Xác nhận Thanh toán"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderPage;

