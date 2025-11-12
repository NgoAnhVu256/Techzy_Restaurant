import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomerManagement.css';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    status: 'active'
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5078/api/KhachHang');
      setCustomers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const dataToSubmit = {
        hoTen: formData.fullName,
        email: formData.email.trim() || null,
        soDienThoai: formData.phone,
        diaChi: formData.address.trim() || null,
        trangThai: formData.status
      };

      if (selectedCustomer) {
        await axios.put(`http://localhost:5078/api/KhachHang/${selectedCustomer.maKhachHang}`, dataToSubmit);
        setSuccess('Customer updated successfully');
      } else {
        await axios.post('http://localhost:5078/api/KhachHang', dataToSubmit);
        setSuccess('Customer added successfully');
      }
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        status: 'active'
      });
      setSelectedCustomer(null);
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      setError('Failed to save customer');
      console.error('Error saving customer:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      fullName: customer.hoTen,
      email: customer.email || '',
      phone: customer.soDienThoai,
      address: customer.diaChi || '',
      status: customer.trangThai
    });
    setShowModal(true);
  };

  const handleToggleStatus = async (customerId, currentStatus) => {
    try {
      setLoading(true);
      await axios.patch(`http://localhost:5078/api/KhachHang/${customerId}`, {
        trangThai: currentStatus === 'active' ? 'inactive' : 'active'
      });
      setSuccess('Customer status updated successfully');
      fetchCustomers();
    } catch (err) {
      setError('Failed to update customer status');
      console.error('Error updating customer status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:5078/api/KhachHang/${customerId}`);
        setSuccess('Customer deleted successfully');
        fetchCustomers();
      } catch (err) {
        setError('Failed to delete customer');
        console.error('Error deleting customer:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.hoTen.toLowerCase().includes(searchLower) ||
      (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
      customer.soDienThoai.includes(searchTerm)
    );
  });

  return (
    <div className="customer-management">
      <h2>Customer Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="customer-actions">
        <button
          className="add-btn"
          onClick={() => {
            setSelectedCustomer(null);
            setFormData({
              fullName: '',
              email: '',
              phone: '',
              address: '',
              status: 'active'
            });
            setShowModal(true);
          }}
        >
          Add New Customer
        </button>
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, email or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Loading customers...</div>
      ) : (
        <div className="customer-list">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <tr key={customer.maKhachHang}>
                  <td>{customer.hoTen}</td>
                  <td>{customer.email || '-'}</td>
                  <td>{customer.soDienThoai}</td>
                  <td>{customer.diaChi || '-'}</td>
                  <td>
                    <span className={`status ${customer.trangThai}`}>
                      {customer.trangThai}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(customer)}
                      >
                        Edit
                      </button>
                      <button
                        className={`action-btn ${customer.trangThai === 'active' ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleStatus(customer.maKhachHang, customer.trangThai)}
                      >
                        {customer.trangThai === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(customer.maKhachHang)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{selectedCustomer ? 'Edit Customer' : 'Add New Customer'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email (Optional)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address (Optional)</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={loading}>
                  {selectedCustomer ? 'Update' : 'Add'} Customer
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement; 