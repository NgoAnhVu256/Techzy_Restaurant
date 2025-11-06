import React, { useState, useEffect } from "react";
import "./Tables.css";
import axios from "axios";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Component for booking history
const BookingHistory = ({ bookings, onClose, onCancel }) => {
  const [filter, setFilter] = useState("all"); // all, upcoming, past
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === "all" ? true :
      filter === "upcoming" ? new Date(booking.thoiGianBatDau) > new Date() :
      new Date(booking.thoiGianBatDau) <= new Date();
    
    const matchesSearch = booking.khachHang.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.ban.tenBan.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="modal">
      <div className="modal-content booking-history">
        <div className="modal-header">
          <h3>Lịch sử đặt bàn</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        
        <div className="booking-filters">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên khách hàng hoặc tên bàn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="upcoming">Sắp tới</option>
            <option value="past">Đã qua</option>
          </select>
        </div>

        <div className="bookings-list">
          {filteredBookings.length === 0 ? (
            <div className="empty-state">
              <p>Không có lịch sử đặt bàn</p>
            </div>
          ) : (
            filteredBookings.map(booking => (
              <div key={booking.maDatBan} className="booking-card">
                <div className="booking-header">
                  <h4>Bàn {booking.ban.tenBan}</h4>
                  <span className={`status-badge ${new Date(booking.thoiGianBatDau) > new Date() ? 'upcoming' : 'past'}`}>
                    {new Date(booking.thoiGianBatDau) > new Date() ? 'Sắp tới' : 'Đã qua'}
                  </span>
                </div>
                <div className="booking-details">
                  <p><strong>Khách hàng:</strong> {booking.khachHang.hoTen}</p>
                  <p><strong>Số điện thoại:</strong> {booking.khachHang.soDienThoai}</p>
                  <p><strong>Thời gian:</strong> {format(new Date(booking.thoiGianBatDau), 'HH:mm dd/MM/yyyy', { locale: vi })} - {format(new Date(booking.thoiGianKetThuc), 'HH:mm dd/MM/yyyy', { locale: vi })}</p>
                  <p><strong>Số người:</strong> {booking.soNguoi}</p>
                  {booking.ghiChu && <p><strong>Ghi chú:</strong> {booking.ghiChu}</p>}
                </div>
                {new Date(booking.thoiGianBatDau) > new Date() && (
                  <button 
                    className="cancel-booking-button"
                    onClick={() => onCancel(booking.maDatBan)}
                  >
                    Hủy đặt bàn
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Component for booking form
const BookingForm = ({ table, onClose, onSubmit, existingBookings }) => {
  const [formData, setFormData] = useState({
    maKH: "",
    thoiGianBatDau: "",
    thoiGianKetThuc: "",
    soNguoi: table.sucChua,
    ghiChu: ""
  });
  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch customers for dropdown
    const fetchCustomers = async () => {
      try {
        const response = await axios.get("http://localhost:5078/api/KhachHang");
        setCustomers(response.data);
      } catch (error) {
        toast.error("Lỗi khi tải danh sách khách hàng");
      }
    };
    fetchCustomers();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    const now = new Date();
    const startTime = new Date(formData.thoiGianBatDau);
    const endTime = new Date(formData.thoiGianKetThuc);

    if (!formData.maKH) newErrors.maKH = "Vui lòng chọn khách hàng";
    if (!formData.thoiGianBatDau) newErrors.thoiGianBatDau = "Vui lòng chọn thời gian bắt đầu";
    if (!formData.thoiGianKetThuc) newErrors.thoiGianKetThuc = "Vui lòng chọn thời gian kết thúc";
    if (formData.soNguoi > table.sucChua) newErrors.soNguoi = `Số người không được vượt quá sức chứa (${table.sucChua})`;
    if (formData.soNguoi < 1) newErrors.soNguoi = "Số người phải lớn hơn 0";
    if (startTime < now) newErrors.thoiGianBatDau = "Thời gian bắt đầu phải sau thời điểm hiện tại";
    if (endTime <= startTime) newErrors.thoiGianKetThuc = "Thời gian kết thúc phải sau thời gian bắt đầu";

    // Check for booking conflicts
    const hasConflict = existingBookings.some(booking => {
      const bookingStart = new Date(booking.thoiGianBatDau);
      const bookingEnd = new Date(booking.thoiGianKetThuc);
      return (startTime < bookingEnd && endTime > bookingStart);
    });

    if (hasConflict) {
      newErrors.thoiGianBatDau = "Thời gian này đã được đặt";
      newErrors.thoiGianKetThuc = "Thời gian này đã được đặt";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit({
        ...formData,
        maBan: table.maBan,
        ngayDat: new Date().toISOString()
      });
      onClose();
    } catch (error) {
      toast.error("Lỗi khi đặt bàn");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content booking-form">
        <div className="modal-header">
          <h3>Đặt bàn {table.tenBan}</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Khách hàng <span className="required">*</span></label>
            <select
              value={formData.maKH}
              onChange={(e) => setFormData({ ...formData, maKH: e.target.value })}
              className={errors.maKH ? 'error' : ''}
            >
              <option value="">Chọn khách hàng</option>
              {customers.map(customer => (
                <option key={customer.maKhachHang} value={customer.maKhachHang}>
                  {customer.hoTen} - {customer.soDienThoai}
                </option>
              ))}
            </select>
            {errors.maKH && <span className="error-message">{errors.maKH}</span>}
          </div>

          <div className="form-group">
            <label>Thời gian bắt đầu <span className="required">*</span></label>
            <input
              type="datetime-local"
              value={formData.thoiGianBatDau}
              onChange={(e) => setFormData({ ...formData, thoiGianBatDau: e.target.value })}
              className={errors.thoiGianBatDau ? 'error' : ''}
              min={new Date().toISOString().slice(0, 16)}
            />
            {errors.thoiGianBatDau && <span className="error-message">{errors.thoiGianBatDau}</span>}
          </div>

          <div className="form-group">
            <label>Thời gian kết thúc <span className="required">*</span></label>
            <input
              type="datetime-local"
              value={formData.thoiGianKetThuc}
              onChange={(e) => setFormData({ ...formData, thoiGianKetThuc: e.target.value })}
              className={errors.thoiGianKetThuc ? 'error' : ''}
              min={formData.thoiGianBatDau || new Date().toISOString().slice(0, 16)}
            />
            {errors.thoiGianKetThuc && <span className="error-message">{errors.thoiGianKetThuc}</span>}
          </div>

          <div className="form-group">
            <label>Số người <span className="required">*</span></label>
            <input
              type="number"
              value={formData.soNguoi}
              onChange={(e) => setFormData({ ...formData, soNguoi: parseInt(e.target.value) })}
              min="1"
              max={table.sucChua}
              className={errors.soNguoi ? 'error' : ''}
            />
            {errors.soNguoi && <span className="error-message">{errors.soNguoi}</span>}
            <small>Sức chứa tối đa: {table.sucChua} người</small>
          </div>

          <div className="form-group">
            <label>Ghi chú</label>
            <textarea
              value={formData.ghiChu}
              onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
              placeholder="Nhập ghi chú (nếu có)"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Hủy
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đặt bàn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTable, setNewTable] = useState({
    tenBan: "",
    sucChua: "",
    trangThai: false,
  });

  // Fetch tables and bookings
  const fetchTables = async () => {
    try {
      const [tablesResponse, bookingsResponse] = await Promise.all([
        axios.get("http://localhost:5078/api/Ban"),
        axios.get("http://localhost:5078/api/DatBan")
      ]);
      setTables(tablesResponse.data);
      setBookings(bookingsResponse.data);
    } catch (error) {
      toast.error("Lỗi khi tải dữ liệu");
    }
  };

  useEffect(() => {
    fetchTables();
    // Set up polling for real-time updates
    const interval = setInterval(fetchTables, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Handle booking submission
  const handleBooking = async (bookingData) => {
    try {
      await axios.post("http://localhost:5078/api/DatBan", bookingData);
      toast.success("Đặt bàn thành công");
      fetchTables();
      
      // Send notification to admin
      const customer = customers.find(c => c.maKhachHang === bookingData.maKH);
      const notification = {
        title: "Đặt bàn mới",
        message: `Khách hàng ${customer.hoTen} vừa đặt bàn ${selectedTable.tenBan}`,
        type: "booking"
      };
      // TODO: Implement notification system
    } catch (error) {
      toast.error("Lỗi khi đặt bàn");
      throw error;
    }
  };

  // Handle booking cancellation
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Bạn có chắc muốn hủy đặt bàn này?")) return;
    
    try {
      await axios.delete(`http://localhost:5078/api/DatBan/${bookingId}`);
      toast.success("Hủy đặt bàn thành công");
      fetchTables();
    } catch (error) {
      toast.error("Lỗi khi hủy đặt bàn");
    }
  };

  // Add new table
  const handleAdd = async () => {
    try {
      await axios.post("http://localhost:5078/api/Ban", newTable);
      toast.success("Thêm bàn thành công");
      fetchTables();
      setShowAddModal(false);
      setNewTable({ tenBan: "", sucChua: "", trangThai: false });
    } catch (error) {
      toast.error("Lỗi khi thêm bàn");
    }
  };

  // Edit table
  const handleEdit = async () => {
    try {
      await axios.put(
        `http://localhost:5078/api/Ban/${selectedTable.maBan}`,
        selectedTable
      );
      toast.success("Cập nhật bàn thành công");
      fetchTables();
      setShowEditModal(false);
    } catch (error) {
      toast.error("Lỗi khi cập nhật bàn");
    }
  };

  // Delete table
  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:5078/api/Ban/${selectedTable.maBan}`
      );
      toast.success("Xóa bàn thành công");
      fetchTables();
      setShowDeleteModal(false);
    } catch (error) {
      toast.error("Lỗi khi xóa bàn");
    }
  };

  // Filter tables
  const filteredTables = tables.filter((table) =>
    table.tenBan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="tables-container">
      <div className="tables-header">
        <h2>Quản lý bàn ăn</h2>
        <div className="tables-actions">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="history-button" onClick={() => setShowHistoryModal(true)}>
            Lịch sử đặt bàn
          </button>
          <button className="add-button" onClick={() => setShowAddModal(true)}>
            Thêm bàn mới
          </button>
        </div>
      </div>

      <div className="tables-grid">
        {filteredTables.map((table) => {
          // Sử dụng trực tiếp trường trangThai từ backend
          const isAvailable = table.trangThai;

          return (
            <div key={table.maBan} className={`table-card ${!isAvailable ? 'booked' : ''}`}>
              <div className="table-header">
                <h3>{table.tenBan}</h3>
                <span className={`status-badge ${!isAvailable ? 'booked' : 'available'}`}>
                  {!isAvailable ? 'Đã đặt' : 'Trống'}
                </span>
              </div>
              <div className="table-details">
                <p><strong>Sức chứa:</strong> {table.sucChua} người</p>
                {/* Nếu muốn hiển thị thông tin booking hiện tại, có thể giữ lại đoạn dưới */}
              </div>
              <div className="table-actions">
                {isAvailable && (
                  <button
                    className="book-button"
                    onClick={() => {
                      setSelectedTable(table);
                      setShowBookingModal(true);
                    }}
                  >
                    Đặt bàn
                  </button>
                )}
                <button
                  className="edit-button"
                  onClick={() => {
                    setSelectedTable(table);
                    setShowEditModal(true);
                  }}
                >
                  Sửa
                </button>
                <button
                  className="delete-button"
                  onClick={() => {
                    setSelectedTable(table);
                    setShowDeleteModal(true);
                  }}
                >
                  Xóa
                </button>
                <button
                  className="history-button"
                  onClick={() => {
                    setSelectedTable(table);
                    setShowHistoryModal(true);
                  }}
                >
                  Lịch sử
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Thêm bàn mới</h3>
              <button onClick={() => setShowAddModal(false)} className="close-button">&times;</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
              <div className="form-group">
                <label>Tên bàn <span className="required">*</span></label>
                <input
                  type="text"
                  value={newTable.tenBan}
                  onChange={(e) => setNewTable({ ...newTable, tenBan: e.target.value })}
                  required
                  placeholder="Nhập tên bàn"
                />
              </div>
              <div className="form-group">
                <label>Sức chứa <span className="required">*</span></label>
                <input
                  type="number"
                  value={newTable.sucChua}
                  onChange={(e) => setNewTable({ ...newTable, sucChua: parseInt(e.target.value) })}
                  required
                  min="1"
                  placeholder="Nhập sức chứa"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-button">
                  Hủy
                </button>
                <button type="submit" className="submit-button">
                  Thêm bàn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedTable && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Sửa thông tin bàn</h3>
              <button onClick={() => setShowEditModal(false)} className="close-button">&times;</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }}>
              <div className="form-group">
                <label>Tên bàn <span className="required">*</span></label>
                <input
                  type="text"
                  value={selectedTable.tenBan}
                  onChange={(e) => setSelectedTable({ ...selectedTable, tenBan: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Sức chứa <span className="required">*</span></label>
                <input
                  type="number"
                  value={selectedTable.sucChua}
                  onChange={(e) => setSelectedTable({ ...selectedTable, sucChua: parseInt(e.target.value) })}
                  required
                  min="1"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-button">
                  Hủy
                </button>
                <button type="submit" className="submit-button">
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedTable && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Xác nhận xóa</h3>
              <button onClick={() => setShowDeleteModal(false)} className="close-button">&times;</button>
            </div>
            <p>Bạn có chắc chắn muốn xóa bàn {selectedTable.tenBan}?</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)} className="cancel-button">
                Hủy
              </button>
              <button onClick={handleDelete} className="delete-button">
                Xóa bàn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBookingModal && selectedTable && (
        <BookingForm
          table={selectedTable}
          onClose={() => setShowBookingModal(false)}
          onSubmit={handleBooking}
          existingBookings={bookings.filter(b => b.maBan === selectedTable.maBan)}
        />
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <BookingHistory
          bookings={bookings}
          onClose={() => setShowHistoryModal(false)}
          onCancel={handleCancelBooking}
        />
      )}
    </div>
  );
};

export default Tables;
