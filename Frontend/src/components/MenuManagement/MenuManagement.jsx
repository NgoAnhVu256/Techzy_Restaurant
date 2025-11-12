import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MenuManagement.css';

const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    status: 'active'
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/menu');
      setMenuItems(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch menu items');
      console.error('Error fetching menu items:', err);
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
      if (selectedItem) {
        await axios.put(`http://localhost:5000/api/menu/${selectedItem._id}`, formData);
        setSuccess('Menu item updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/menu', formData);
        setSuccess('Menu item added successfully');
      }
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        status: 'active'
      });
      setSelectedItem(null);
      fetchMenuItems();
    } catch (err) {
      setError('Failed to save menu item');
      console.error('Error saving menu item:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image: item.image,
      status: item.status
    });
  };

  const handleToggleStatus = async (itemId, currentStatus) => {
    try {
      setLoading(true);
      await axios.patch(`http://localhost:5000/api/menu/${itemId}`, {
        status: currentStatus === 'active' ? 'inactive' : 'active'
      });
      setSuccess('Menu item status updated successfully');
      fetchMenuItems();
    } catch (err) {
      setError('Failed to update menu item status');
      console.error('Error updating menu item status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      status: 'active'
    });
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="menu-management">
      <h2>Menu Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="menu-form">
        <h3>{selectedItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price (VND)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                <option value="appetizer">Appetizer</option>
                <option value="main">Main Course</option>
                <option value="dessert">Dessert</option>
                <option value="drink">Drink</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="image">Image URL</label>
              <input
                type="text"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {selectedItem ? 'Update' : 'Add'} Item
            </button>
            {selectedItem && (
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="menu-filters">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="category-filter"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="appetizer">Appetizer</option>
          <option value="main">Main Course</option>
          <option value="dessert">Dessert</option>
          <option value="drink">Drink</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading menu items...</div>
      ) : (
        <div className="menu-list">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item._id}>
                  <td>
                    <img src={item.image} alt={item.name} className="item-image" />
                  </td>
                  <td>
                    <div className="item-name">{item.name}</div>
                    <div className="item-description">{item.description}</div>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.price.toLocaleString('vi-VN')} VND</td>
                  <td>
                    <span className={`status ${item.status}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit"
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        className={`action-btn ${item.status === 'active' ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleStatus(item._id, item.status)}
                      >
                        {item.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
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

export default MenuManagement; 