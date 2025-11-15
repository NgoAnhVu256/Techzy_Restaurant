import React, { useState, useEffect } from 'react';
import api from '@/utils/axios'; // Import api instance

const BookingForm = ({ onSubmit, selectedFoods = [], loading: bookingLoading }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: 1,
    tableId: '',
    notes: '',
    // Customer Information fields
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
  });

  const [availableTables, setAvailableTables] = useState([]);
  const [tablesLoading, setTablesLoading] = useState(false);
  const [tablesError, setTablesError] = useState(null);

  // Fetch available tables when date, time, or guests change
  useEffect(() => {
    const fetchAvailableTables = async () => {
      const { date, time, guests } = formData;

      if (!date || !time || guests <= 0) {
        setAvailableTables([]);
        setTablesError(null);
        return;
      }

      setTablesLoading(true);
      setTablesError(null);
      try {
        // Construct DateTime objects from date and time strings
        const startDateTime = new Date(`${date}T${time}:00`);
        // Add 1 hour for the end time (adjust duration as needed)
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

        // Format as ISO 8601 strings with timezone (UTC)
        const startTimeISO = startDateTime.toISOString();
        const endTimeISO = endDateTime.toISOString();

        const response = await api.get('/Ban/available', {
          params: {
            soNguoi: guests,
            thoiGianBatDau: startTimeISO,
            thoiGianKetThuc: endTimeISO,
          },
        });

        if (response.data && Array.isArray(response.data)) {
          setAvailableTables(response.data);
          if (response.data.length > 0) {
            // Automatically select the first available table if any
            setFormData(prev => ({ ...prev, tableId: response.data[0].maBan }));
          } else {
            setFormData(prev => ({ ...prev, tableId: '' }));
          }
        } else {
          setAvailableTables([]);
          setFormData(prev => ({ ...prev, tableId: '' }));
          setTablesError('Invalid response format for tables.');
          console.error('Invalid response format for tables:', response.data);
        }
      } catch (err) {
        console.error('Error fetching available tables:', err.response?.data || err.message);
        setAvailableTables([]);
        setFormData(prev => ({ ...prev, tableId: '' }));
        setTablesError('Không thể tải danh sách bàn trống. Vui lòng thử lại sau.');
      } finally {
        setTablesLoading(false);
      }
    };

    fetchAvailableTables();
  }, [formData.date, formData.time, formData.guests]); // Re-fetch when these change

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Pass both formData and selectedFoods to the onSubmit handler
    onSubmit({ ...formData, selectedFoods });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Thông tin đặt bàn và Khách hàng</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giờ <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số lượng khách <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="guests"
            value={formData.guests}
            onChange={handleChange}
            min="1"
            max="20"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn bàn <span className="text-red-500">*</span>
          </label>
          {tablesLoading ? (
            <p className="text-gray-500">Đang tải danh sách bàn...</p>
          ) : tablesError ? (
            <p className="text-red-500">{tablesError}</p>
          ) : availableTables.length === 0 ? (
            <p className="text-gray-500">Không có bàn trống phù hợp</p>
          ) : (
            <select
              name="tableId"
              value={formData.tableId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Chọn bàn</option>
              {availableTables.map(table => (
                <option key={table.maBan} value={table.maBan}>
                  {table.tenBan} (Sức chứa: {table.sucChua} người)
                </option>
              ))}
            </select>
          )}
        </div>

        <h3 className="text-xl font-bold mb-4 text-gray-800 pt-6 border-t">Thông tin khách hàng</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Họ tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email (Tùy chọn)
          </label>
          <input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ (Tùy chọn)
          </label>
          <input
            type="text"
            name="customerAddress"
            value={formData.customerAddress}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú (Tùy chọn)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        {selectedFoods.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Món ăn đã chọn</h3>
            <ul className="space-y-2">
              {selectedFoods.map((food, index) => (
                <li key={index} className="flex justify-between">
                  <span>{food.TenMon || 'Unknown Item'}</span>
                  <span>{food.quantity} x {(food.GiaSauGiam || food.Gia)?.toLocaleString('vi-VN')}đ</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-3 px-6 rounded-md transition-colors ${bookingLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          disabled={bookingLoading || availableTables.length === 0 || !formData.tableId || !formData.customerName || !formData.customerPhone}
        >
          {bookingLoading ? 'Đang đặt...' : selectedFoods.length > 0 ? 'Xác nhận đặt bàn + món' : 'Xác nhận đặt bàn'}
        </button>
      </form>
    </div>
  );
};

export default BookingForm; 
