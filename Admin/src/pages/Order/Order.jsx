import React, { useState, useEffect } from "react";
import "./Order.css";
import axios from "axios";
import { toast } from "react-toastify";

const Order = () => {
  const [tables, setTables] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [editedTable, setEditedTable] = useState({
    tenBan: "",
    sucChua: "",
  });
  const [newTable, setNewTable] = useState({
    tenBan: "",
    sucChua: "",
    trangThai: false,
  });

  // Fetch tables
  const fetchTables = async () => {
    try {
      const response = await axios.get("http://localhost:5078/api/Ban");
      setTables(response.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách bàn");
    }
  };

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const response = await axios.get("http://localhost:5078/api/DatBan");
      setBookings(response.data);
    } catch (error) {
      toast.error("Lỗi khi tải danh sách đặt bàn");
    }
  };

  useEffect(() => {
    fetchTables();
    fetchBookings();
  }, []);

  // Check if table name exists
  const isTableNameExists = (name, excludeId = null) => {
    return tables.some(
      (table) =>
        table.tenBan.toLowerCase() === name.toLowerCase() &&
        table.maBan !== excludeId
    );
  };

  // Add new table
  const handleAddTable = async (e) => {
    e.preventDefault();
    if (isTableNameExists(newTable.tenBan)) {
      toast.error("Tên bàn đã tồn tại!");
      return;
    }
    try {
      await axios.post("http://localhost:5078/api/Ban", newTable);
      toast.success("Thêm bàn thành công");
      fetchTables();
      setShowAddModal(false);
      setNewTable({
        tenBan: "",
        sucChua: "",
        trangThai: false,
      });
    } catch (error) {
      toast.error("Lỗi khi thêm bàn");
    }
  };

  // Edit table
  const handleEditTable = async (e) => {
    e.preventDefault();
    if (isTableNameExists(editedTable.tenBan, selectedTable.maBan)) {
        toast.error("Tên bàn đã tồn tại!");
        return;
    }
    try {
        await axios.put(`http://localhost:5078/api/Ban/${selectedTable.maBan}`, {
            tenBan: editedTable.tenBan,
            sucChua: parseInt(editedTable.sucChua)
        });
        toast.success("Cập nhật bàn thành công");
        fetchTables();
        setShowEditModal(false);
    } catch (error) {
        if (error.response) {
            if (error.response.status === 404) {
                toast.error("Không tìm thấy bàn này!");
            } else if (error.response.status === 400) {
                toast.error(error.response.data);
            } else {
                toast.error("Lỗi khi cập nhật bàn");
            }
        } else {
            toast.error("Lỗi kết nối đến server");
        }
    }
};

  // Delete table
  const handleDeleteTable = async () => {
    if (isTableBooked(selectedTable.maBan)) {
      toast.error("Không thể xóa bàn đang được đặt!");
      return;
    }
    try {
      await axios.delete(
        `http://localhost:5078/api/Ban/${selectedTable.maBan}`
      );
      toast.success("Xóa bàn thành công");
      fetchTables();
      setShowDeleteModal(false);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          toast.error("Không tìm thấy bàn này!");
        } else if (error.response.status === 400) {
          toast.error(error.response.data);
        } else {
          toast.error("Lỗi khi xóa bàn");
        }
      } else {
        toast.error("Lỗi kết nối đến server");
      }
    }
  };

  // Check if table is currently booked
  const isTableBooked = (tableId) => {
    const currentTime = new Date();
    return bookings.some(
      (booking) =>
        booking.maBan === tableId &&
        new Date(booking.thoiGianBatDau) <= currentTime &&
        new Date(booking.thoiGianKetThuc) >= currentTime
    );
  };

  return (
    <div className="order-container">
      <h2>Quản lý bàn</h2>

      <div className="tables-grid">
        {tables.map((table) => (
          <div
            key={table.maBan}
            className={`table-card ${
              isTableBooked(table.maBan) ? "booked" : ""
            }`}
          >
            <h3>{table.tenBan}</h3>
            <p>Sức chứa: {table.sucChua} người</p>
            <p>Trạng thái: {isTableBooked(table.maBan) ? "Đã đặt" : "Trống"}</p>
            <div className="table-actions">
              <button
                className="edit-button"
                onClick={() => {
                  setSelectedTable(table);
                  setEditedTable({
                    tenBan: table.tenBan,
                    sucChua: table.sucChua,
                  });
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
                disabled={isTableBooked(table.maBan)}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="add-button" onClick={() => setShowAddModal(true)}>
        + Thêm bàn
      </button>

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Thêm bàn mới</h3>
            <form onSubmit={handleAddTable}>
              <div className="form-group">
                <label>Tên bàn:</label>
                <input
                  type="text"
                  value={newTable.tenBan}
                  onChange={(e) =>
                    setNewTable({ ...newTable, tenBan: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Sức chứa:</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={newTable.sucChua}
                  onChange={(e) =>
                    setNewTable({ ...newTable, sucChua: e.target.value })
                  }
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit">Thêm</button>
                <button type="button" onClick={() => setShowAddModal(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Sửa bàn</h3>
            <form onSubmit={handleEditTable}>
              <div className="form-group">
                <label>Tên bàn:</label>
                <input
                  type="text"
                  value={editedTable.tenBan}
                  onChange={(e) =>
                    setEditedTable({ ...editedTable, tenBan: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Sức chứa:</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={editedTable.sucChua}
                  onChange={(e) =>
                    setEditedTable({ ...editedTable, sucChua: e.target.value })
                  }
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit">Lưu</button>
                <button type="button" onClick={() => setShowEditModal(false)}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa {selectedTable.tenBan} không?</p>
            <div className="modal-actions">
              <button onClick={handleDeleteTable}>Xóa</button>
              <button onClick={() => setShowDeleteModal(false)}>Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;
