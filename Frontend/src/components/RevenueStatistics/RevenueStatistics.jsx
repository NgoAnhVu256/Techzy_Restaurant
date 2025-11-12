import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RevenueStatistics.css';

const RevenueStatistics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topSellingItems: [],
    revenueByCategory: [],
    revenueByDay: []
  });

  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    setDateRange({
      startDate: lastMonth.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
  }, []);

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      fetchStatistics();
    }
  }, [dateRange]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/statistics/revenue', {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      setStatistics(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch revenue statistics');
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="revenue-statistics">
      <h2>Revenue Statistics</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="date-filters">
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={dateRange.startDate}
            onChange={handleDateChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={dateRange.endDate}
            onChange={handleDateChange}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading statistics...</div>
      ) : (
        <>
          <div className="statistics-overview">
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p className="stat-value">{statistics.totalRevenue.toLocaleString('vi-VN')} VND</p>
            </div>
            <div className="stat-card">
              <h3>Total Orders</h3>
              <p className="stat-value">{statistics.totalOrders}</p>
            </div>
            <div className="stat-card">
              <h3>Average Order Value</h3>
              <p className="stat-value">{statistics.averageOrderValue.toLocaleString('vi-VN')} VND</p>
            </div>
          </div>

          <div className="statistics-details">
            <div className="stat-section">
              <h3>Top Selling Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.topSellingItems.map(item => (
                    <tr key={item._id}>
                      <td>{item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{item.revenue.toLocaleString('vi-VN')} VND</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="stat-section">
              <h3>Revenue by Category</h3>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Revenue</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.revenueByCategory.map(category => (
                    <tr key={category._id}>
                      <td>{category.name}</td>
                      <td>{category.revenue.toLocaleString('vi-VN')} VND</td>
                      <td>{category.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="stat-section">
              <h3>Revenue by Day</h3>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Revenue</th>
                    <th>Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.revenueByDay.map(day => (
                    <tr key={day.date}>
                      <td>{new Date(day.date).toLocaleDateString()}</td>
                      <td>{day.revenue.toLocaleString('vi-VN')} VND</td>
                      <td>{day.orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RevenueStatistics; 