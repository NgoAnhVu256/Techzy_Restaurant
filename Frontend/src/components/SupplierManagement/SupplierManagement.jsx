import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import './SupplierManagement.css';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({
    tenNhaCungCap: '',
    diaChi: '',
    soDienThoai: '',
    email: '',
    trangThai: 'active'
  });

  // Fetch suppliers
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/NhaCungCap');
      setSuppliers(response.data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách nhà cung cấp');
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
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
      await api.post('/NhaCungCap', form);
      setSuccess('Thêm nhà cung cấp thành công');
      fetchSuppliers();
      setForm({
        tenNhaCungCap: '',
        diaChi: '',
        soDienThoai: '',
        email: '',
        trangThai: 'active'
      });
    } catch (err) {
      setError('Không thể thêm nhà cung cấp');
      console.error('Error adding supplier:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (maNhaCungCap, currentStatus) => {
    try {
      await api.put(`/NhaCungCap/${maNhaCungCap}/toggle-status`, {
        trangThai: currentStatus === 'active' ? 'inactive' : 'active'
      });
      setSuccess(`Nhà cung cấp đã được ${currentStatus === 'active' ? 'tạm dừng' : 'kích hoạt'}`);
      fetchSuppliers();
    } catch (err) {
      setError('Không thể thay đổi trạng thái nhà cung cấp');
      console.error('Error toggling supplier status:', err);
    }
  };

  // Filter suppliers based on search term
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.tenNhaCungCap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.diaChi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="supplier-management">
      <h2>Quản lý nhà cung cấp</h2>

      <div className="supplier-filters">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, địa chỉ, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="supplier-form">
        <h3>Thêm nhà cung cấp mới</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Tên nhà cung cấp</label>
              <input
                type="text"
                name="tenNhaCungCap"
                value={form.tenNhaCungCap}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Địa chỉ</label>
              <input
                type="text"
                name="diaChi"
                value={form.diaChi}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="tel"
                name="soDienThoai"
                value={form.soDienThoai}
                onChange={handleChange}
                required
                pattern="[0-9]{10}"
                title="Số điện thoại phải có 10 chữ số"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Thêm nhà cung cấp'}
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="suppliers-list">
        <h3>Danh sách nhà cung cấp</h3>
        <table>
          <thead>
            <tr>
              <th>Tên nhà cung cấp</th>
              <th>Địa chỉ</th>
              <th>Số điện thoại</th>
              <th>Email</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map(supplier => (
              <tr key={supplier.maNhaCungCap}>
                <td>{supplier.tenNhaCungCap}</td>
                <td>{supplier.diaChi}</td>
                <td>{supplier.soDienThoai}</td>
                <td>{supplier.email}</td>
                <td>
                  <span className={`status ${supplier.trangThai}`}>
                    {supplier.trangThai === 'active' ? 'Đang hoạt động' : 'Đã tạm dừng'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleToggleStatus(supplier.maNhaCungCap, supplier.trangThai)}
                    className={`action-btn ${supplier.trangThai === 'active' ? 'deactivate' : 'activate'}`}
                  >
                    {supplier.trangThai === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
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

export default SupplierManagement; 