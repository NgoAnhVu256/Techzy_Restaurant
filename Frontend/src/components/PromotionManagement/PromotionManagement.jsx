import React, { useState, useEffect } from 'react';
import api from '@/utils/axios';
import './PromotionManagement.css';

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    tenKhuyenMai: '',
    moTa: '',
    ngayBatDau: '',
    ngayKetThuc: '',
    phanTramGiam: '',
    maLoaiMon: '',
    trangThai: 'active'
  });

  // Fetch promotions
  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/KhuyenMai');
      setPromotions(response.data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách khuyến mãi');
      console.error('Error fetching promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/KhuyenMai', form);
      setSuccess('Thêm khuyến mãi thành công');
      fetchPromotions();
      setForm({
        tenKhuyenMai: '',
        moTa: '',
        ngayBatDau: '',
        ngayKetThuc: '',
        phanTramGiam: '',
        maLoaiMon: '',
        trangThai: 'active'
      });
    } catch (err) {
      setError('Không thể thêm khuyến mãi');
      console.error('Error adding promotion:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (maKhuyenMai, currentStatus) => {
    try {
      await api.put(`/KhuyenMai/${maKhuyenMai}/toggle-status`, {
        trangThai: currentStatus === 'active' ? 'inactive' : 'active'
      });
      setSuccess(`Khuyến mãi đã được ${currentStatus === 'active' ? 'tạm dừng' : 'kích hoạt'}`);
      fetchPromotions();
    } catch (err) {
      setError('Không thể thay đổi trạng thái khuyến mãi');
      console.error('Error toggling promotion status:', err);
    }
  };

  return (
    <div className="promotion-management">
      <h2>Quản lý khuyến mãi</h2>

      <div className="promotion-form">
        <h3>Thêm khuyến mãi mới</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên khuyến mãi</label>
            <input
              type="text"
              name="tenKhuyenMai"
              value={form.tenKhuyenMai}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Mô tả</label>
            <textarea
              name="moTa"
              value={form.moTa}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ngày bắt đầu</label>
              <input
                type="date"
                name="ngayBatDau"
                value={form.ngayBatDau}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Ngày kết thúc</label>
              <input
                type="date"
                name="ngayKetThuc"
                value={form.ngayKetThuc}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phần trăm giảm</label>
              <input
                type="number"
                name="phanTramGiam"
                value={form.phanTramGiam}
                onChange={handleChange}
                min="0"
                max="100"
                required
              />
            </div>

            <div className="form-group">
              <label>Loại món</label>
              <select
                name="maLoaiMon"
                value={form.maLoaiMon}
                onChange={handleChange}
                required
              >
                <option value="">Chọn loại món</option>
                <option value="1">Món chính</option>
                <option value="2">Món phụ</option>
                <option value="3">Đồ uống</option>
                <option value="4">Tráng miệng</option>
              </select>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Thêm khuyến mãi'}
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="promotions-list">
        <h3>Danh sách khuyến mãi</h3>
        <table>
          <thead>
            <tr>
              <th>Tên khuyến mãi</th>
              <th>Mô tả</th>
              <th>Thời gian</th>
              <th>Giảm giá</th>
              <th>Loại món</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map(promotion => (
              <tr key={promotion.maKhuyenMai}>
                <td>{promotion.tenKhuyenMai}</td>
                <td>{promotion.moTa}</td>
                <td>
                  {new Date(promotion.ngayBatDau).toLocaleDateString()} - 
                  {new Date(promotion.ngayKetThuc).toLocaleDateString()}
                </td>
                <td>{promotion.phanTramGiam}%</td>
                <td>
                  {promotion.maLoaiMon === 1 ? 'Món chính' :
                   promotion.maLoaiMon === 2 ? 'Món phụ' :
                   promotion.maLoaiMon === 3 ? 'Đồ uống' : 'Tráng miệng'}
                </td>
                <td>
                  <span className={`status ${promotion.trangThai}`}>
                    {promotion.trangThai === 'active' ? 'Đang áp dụng' : 'Đã tạm dừng'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleToggleStatus(promotion.maKhuyenMai, promotion.trangThai)}
                    className={`action-btn ${promotion.trangThai === 'active' ? 'deactivate' : 'activate'}`}
                  >
                    {promotion.trangThai === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PromotionManagement; 
