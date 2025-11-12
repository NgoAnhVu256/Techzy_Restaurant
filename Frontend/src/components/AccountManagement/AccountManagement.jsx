import React, { useState, useEffect } from 'react';
import api from '../../utils/axios';
import './AccountManagement.css';

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch accounts
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/TaiKhoan');
      setAccounts(response.data);
      setError('');
    } catch (err) {
      setError('Không thể tải danh sách tài khoản');
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle role filter
  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
  };

  // Filter accounts based on search term and role
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.tenDangNhap.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || account.maVaiTro.toString() === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Handle account lock/unlock
  const handleToggleLock = async (accountId, currentStatus) => {
    try {
      await api.put(`/TaiKhoan/${accountId}/toggle-lock`, {
        isLocked: !currentStatus
      });
      setSuccess(`Tài khoản đã được ${currentStatus ? 'mở khóa' : 'khóa'} thành công`);
      fetchAccounts(); // Refresh the list
    } catch (err) {
      setError('Không thể thay đổi trạng thái tài khoản');
      console.error('Error toggling account lock:', err);
    }
  };

  // Handle password reset
  const handleResetPassword = async (accountId) => {
    try {
      await api.post(`/TaiKhoan/${accountId}/reset-password`);
      setSuccess('Mật khẩu đã được đặt lại thành công');
    } catch (err) {
      setError('Không thể đặt lại mật khẩu');
      console.error('Error resetting password:', err);
    }
  };

  return (
    <div className="account-management">
      <h2>Quản lý tài khoản</h2>
      
      <div className="account-filters">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, email..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        
        <select value={roleFilter} onChange={handleRoleFilter} className="role-filter">
          <option value="all">Tất cả vai trò</option>
          <option value="1">Admin</option>
          <option value="2">Nhân viên</option>
          <option value="3">Khách hàng</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <div className="accounts-list">
          <table>
            <thead>
              <tr>
                <th>Tên đăng nhập</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map(account => (
                <tr key={account.maTaiKhoan}>
                  <td>{account.tenDangNhap}</td>
                  <td>{account.hoTen}</td>
                  <td>{account.email}</td>
                  <td>
                    {account.maVaiTro === 1 ? 'Admin' :
                     account.maVaiTro === 2 ? 'Nhân viên' : 'Khách hàng'}
                  </td>
                  <td>
                    <span className={`status ${account.isLocked ? 'locked' : 'active'}`}>
                      {account.isLocked ? 'Đã khóa' : 'Hoạt động'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleLock(account.maTaiKhoan, account.isLocked)}
                      className={`action-btn ${account.isLocked ? 'unlock' : 'lock'}`}
                    >
                      {account.isLocked ? 'Mở khóa' : 'Khóa'}
                    </button>
                    <button
                      onClick={() => handleResetPassword(account.maTaiKhoan)}
                      className="action-btn reset"
                    >
                      Đặt lại mật khẩu
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AccountManagement; 